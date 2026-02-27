package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"io"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"github.com/emersion/go-message/mail"
)

// Email represents an email message
type Email struct {
	ID        string   `json:"id"`
	AccountID string   `json:"accountId"`
	Folder    string   `json:"folder"`
	UID       uint32   `json:"uid"`
	From      string   `json:"from"`
	To        []string `json:"to"`
	CC        []string `json:"cc"`
	Subject   string   `json:"subject"`
	Date      string   `json:"date"`
	Body      string   `json:"body"`
	IsRead    bool     `json:"isRead"`
	IsStarred bool     `json:"isStarred"`
	CreatedAt string   `json:"createdAt"`
}

// Folder represents a mailbox folder
type Folder struct {
	Name   string `json:"name"`
	Unread int    `json:"unread"`
	Total  int    `json:"total"`
}

// MailService handles email operations
type MailService struct {
	accountService *MailAccountService
	cache          *EmailCache
}

// NewMailService creates a new mail service
func NewMailService(accountService *MailAccountService) *MailService {
	// Initialize cache
	configDir, _ := getUserConfigDir()
	cachePath := fmt.Sprintf("%s/wmail/emails.db", configDir)

	cache, err := NewEmailCache(cachePath)
	if err != nil {
		fmt.Printf("[MailService] Failed to initialize cache: %v\n", err)
		cache = nil
	} else {
		fmt.Printf("[MailService] Cache initialized at %s\n", cachePath)
	}

	return &MailService{
		accountService: accountService,
		cache:          cache,
	}
}

// GetEmails retrieves emails from a folder with cache support
// forceRefresh: if true, bypass cache and fetch from server
func (s *MailService) GetEmails(accountID, folder string, page, pageSize int, forceRefresh bool) ([]*Email, error) {
	fmt.Printf("[GetEmails] ENTRY - accountID=%s, folder=%s, page=%d, pageSize=%d, forceRefresh=%t\n",
		accountID, folder, page, pageSize, forceRefresh)

	shouldRefresh := forceRefresh

	// Try to get from cache first (unless force refresh is requested)
	if !shouldRefresh && s.cache != nil {
		fmt.Printf("[GetEmails] Checking cache...\n")
		cachedCount, err := s.cache.GetCachedCount(accountID, folder)
		if err == nil && cachedCount > 0 {
			fmt.Printf("[GetEmails] Found %d cached emails, returning from cache\n", cachedCount)
			return s.cache.GetCachedEmails(accountID, folder, page, pageSize)
		}
		fmt.Printf("[GetEmails] No cached emails found (count=%d, err=%v)\n", cachedCount, err)
	}

	account, err := s.accountService.GetAccount(accountID)
	if err != nil {
		fmt.Printf("[GetEmails] Failed to get account: %v\n", err)
		return nil, err
	}
	fmt.Printf("[GetEmails] Found account: %s\n", account.Email)

	c, err := ConnectIMAP(account)
	if err != nil {
		return nil, err
	}
	defer c.Close()

	// Select mailbox
	fmt.Printf("[GetEmails] Attempting to select folder: %s\n", folder)
	mbox, err := c.Select(folder, false)
	if err != nil {
		fmt.Printf("[GetEmails] Failed to select folder '%s': %v\n", folder, err)
		return nil, err
	}
	fmt.Printf("[GetEmails] Successfully selected folder: %s, Messages: %d\n", mbox.Name, mbox.Messages)

	// Return empty if mailbox is empty
	if mbox.Messages == 0 {
		fmt.Println("[GetEmails] The mailbox is empty!")
		return []*Email{}, nil
	}

	fmt.Printf("[GetEmails] Total messages: %d\n", mbox.Messages)

	// Calculate message range for pagination
	from := uint32(1)
	to := mbox.Messages
	fmt.Printf("[GetEmails] Initial range: from=%d, to=%d\n", from, to)
	fmt.Printf("[GetEmails] Pagination params: page=%d, pageSize=%d\n", page, pageSize)
	if pageSize > 0 && page > 0 {
		// Pagination: calculate start and end for reverse chronological order
		offset := uint32((page - 1) * pageSize)
		start := mbox.Messages - offset

		// Calculate end using int to avoid uint32 overflow
		endInt := int(start) - pageSize + 1
		if endInt < 1 {
			endInt = 1
		}
		end := uint32(endInt)

		fmt.Printf("[GetEmails] Calculated start=%d, end=%d\n", start, end)

		// Also make sure start doesn't go above the total messages
		if start > mbox.Messages {
			start = mbox.Messages
		}

		// If after boundary checks, end > start, set end to 1
		if end > start {
			end = 1
		}

		from = end
		to = start
		fmt.Printf("[GetEmails] Final pagination range: from=%d, to=%d\n", from, to)
	}

	// Ensure from <= to
	fmt.Printf("[GetEmails] Final range: from=%d, to=%d\n", from, to)
	if from > to {
		fmt.Printf("[GetEmails] ERROR: from > to, returning empty array\n")
		return []*Email{}, nil
	}

	// Get message sequence set
	seqset := new(imap.SeqSet)
	seqset.AddRange(from, to)
	fmt.Printf("[GetEmails] Fetching range: %d to %d\n", from, to)

	// Get messages
	messages := make(chan *imap.Message, pageSize)
	done := make(chan error, 1)

	go func() {
		fetchErr := c.Fetch(seqset, []imap.FetchItem{
			imap.FetchEnvelope,
			imap.FetchUid,
		}, messages)
		fmt.Printf("[GetEmails] Fetch goroutine completed, err: %v\n", fetchErr)
		done <- fetchErr
	}()

	var emails []*Email
	fmt.Printf("[GetEmails] Starting to receive messages...\n")
	count := 0

	for msg := range messages {
		count++
		fmt.Printf("[GetEmails] Received message %d, UID: %d, Subject: %s\n", count, msg.Uid, msg.Envelope.Subject)
		email := &Email{
			ID:        generateUUID(),
			AccountID: accountID,
			Folder:    folder,
			UID:       msg.Uid,
			From:      formatAddress(msg.Envelope.From),
			To:        formatAddressList(msg.Envelope.To),
			CC:        formatAddressList(msg.Envelope.Cc),
			Subject:   msg.Envelope.Subject,
			Date:      msg.Envelope.Date.Format(time.RFC3339),
			Body:      "", // Body is empty in list view, will fetch when viewing individual email
			CreatedAt: getCurrentTime(),
		}

		emails = append(emails, email)
	}

	fmt.Printf("[GetEmails] Fetch complete, total emails fetched: %d\n", len(emails))

	if err := <-done; err != nil {
		fmt.Printf("[GetEmails] Fetch error: %v\n", err)
		return nil, err
	}

	// Sort emails by date in descending order (newest first)
	sort.Slice(emails, func(i, j int) bool {
		dateI, _ := time.Parse(time.RFC3339, emails[i].Date)
		dateJ, _ := time.Parse(time.RFC3339, emails[j].Date)
		return dateJ.Before(dateI) // j before i means descending
	})
	fmt.Printf("[GetEmails] Sorted emails by date (descending)\n")

	// Cache the fetched emails
	if s.cache != nil && len(emails) > 0 {
		// First delete old cached emails for this folder
		if err := s.cache.DeleteEmails(accountID, folder); err != nil {
			fmt.Printf("[GetEmails] Failed to delete old cache: %v\n", err)
		}

		// Then cache the new emails
		if err := s.cache.CacheEmails(emails); err != nil {
			fmt.Printf("[GetEmails] Failed to cache emails: %v\n", err)
		} else {
			fmt.Printf("[GetEmails] Successfully cached %d emails\n", len(emails))
		}
	}

	return emails, nil
}

// GetEmail retrieves a specific email with body, with cache support
func (s *MailService) GetEmail(accountID, folder string, uid uint32) (*Email, error) {
	// First try to find from cache by UID
	if s.cache != nil {
		cachedEmails, err := s.cache.GetCachedEmails(accountID, folder, 1, 1000)
		if err == nil {
			for _, email := range cachedEmails {
				if email.UID == uid && email.Body != "" {
					fmt.Printf("[GetEmail] Found in cache: %s\n", email.ID)
					return email, nil
				}
			}
		}
	}

	account, err := s.accountService.GetAccount(accountID)
	if err != nil {
		return nil, err
	}

	c, err := ConnectIMAP(account)
	if err != nil {
		return nil, err
	}
	defer c.Close()

	// Select mailbox
	if _, err := c.Select(folder, false); err != nil {
		return nil, err
	}

	// Get message sequence set using UID
	seqset := new(imap.SeqSet)
	seqset.AddNum(uid)

	// Fetch the entire RFC822 message and parse it properly
	items := []imap.FetchItem{
		imap.FetchEnvelope,
		imap.FetchUid,
		imap.FetchRFC822,
	}

	messages := make(chan *imap.Message, 1)
	if err := c.UidFetch(seqset, items, messages); err != nil {
		fmt.Printf("[GetEmail] UID Fetch error: %v\n", err)
		return nil, err
	}

	msg := <-messages
	if msg == nil {
		return nil, fmt.Errorf("message not found")
	}

	// Get the full RFC822 message
	r := msg.GetBody(&imap.BodySectionName{BodyPartName: imap.BodyPartName{}})
	if r == nil {
		return nil, fmt.Errorf("no body found")
	}

	var fullMessage bytes.Buffer
	if _, err := io.Copy(&fullMessage, r); err != nil {
		return nil, fmt.Errorf("failed to read message: %w", err)
	}

	// Parse the message
	mr, err := mail.CreateReader(&fullMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to create mail reader: %w", err)
	}

	var body strings.Builder

	// Iterate through parts to find text content
	for {
		p, err := mr.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			fmt.Printf("[GetEmail] Error reading part: %v, continuing...\n", err)
			continue
		}

		// Get content type from header using Get method
		contentType := p.Header.Get("Content-Type")
		fmt.Printf("[GetEmail] Found part with Content-Type: %s\n", contentType)

		// Parse content type (format: "text/plain; charset=utf-8" or similar)
		mediaType := strings.ToLower(strings.Split(contentType, ";")[0])
		mediaType = strings.TrimSpace(mediaType)

		// Check if this is a text/plain or text/html part
		if mediaType == "text/plain" || mediaType == "text/html" {
			if _, err := io.Copy(&body, p.Body); err != nil {
				fmt.Printf("[GetEmail] Error copying body: %v\n", err)
				continue
			}
			// For plain text, we can stop here
			if mediaType == "text/plain" {
				break
			}
		}
	}

	// Clean up the body content
	bodyText := strings.TrimSpace(body.String())
	bodyText = strings.ReplaceAll(bodyText, "\r\n", "\n")

	email := &Email{
		ID:        generateUUID(),
		AccountID: accountID,
		Folder:    folder,
		UID:       msg.Uid,
		From:      formatAddress(msg.Envelope.From),
		To:        formatAddressList(msg.Envelope.To),
		CC:        formatAddressList(msg.Envelope.Cc),
		Subject:   msg.Envelope.Subject,
		Date:      msg.Envelope.Date.Format(time.RFC3339),
		Body:      bodyText,
		IsRead:    true,
		CreatedAt: getCurrentTime(),
	}

	fmt.Printf("[GetEmail] Got Email %s from server, body length: %d\n", email.ID, len(bodyText))

	// Update cache with body
	if s.cache != nil {
		// Find and update cached email
		cachedEmails, err := s.cache.GetCachedEmails(accountID, folder, 1, 1000)
		if err == nil {
			for _, cached := range cachedEmails {
				if cached.UID == uid {
					if err := s.cache.UpdateEmailBody(cached.ID, email.Body); err != nil {
						fmt.Printf("[GetEmail] Failed to update cache: %v\n", err)
					}
					email.ID = cached.ID // Use cached ID
					break
				}
			}
		}
	}

	return email, nil
}

// SendEmail sends an email
type SendEmailRequest struct {
	AccountID string   `json:"accountId"`
	To        []string `json:"to"`
	CC        []string `json:"cc"`
	BCC       []string `json:"bcc"`
	Subject   string   `json:"subject"`
	Body      string   `json:"body"`
	IsHTML    bool     `json:"isHTML"`
}

func (s *MailService) SendEmail(req *SendEmailRequest) error {
	account, err := s.accountService.GetAccount(req.AccountID)
	if err != nil {
		return err
	}

	// Connect to SMTP
	var c *client.Client
	if account.SMTPUseSSL {
		c, err = client.DialTLS(
			fmt.Sprintf("%s:%d", account.SMTPHost, account.SMTPPort),
			&tls.Config{InsecureSkipVerify: true},
		)
	} else {
		c, err = client.Dial(fmt.Sprintf("%s:%d", account.SMTPHost, account.SMTPPort))
	}
	if err != nil {
		return err
	}
	defer c.Close()

	// Authenticate (use email as username if username is not set)
	username := account.Username
	if username == "" {
		username = account.Email
	}
	if err := c.Login(username, account.Password); err != nil {
		return err
	}

	// TODO: Implement actual email sending
	// This is a placeholder - go-smtp library should be used for actual sending

	return nil
}

// TestConnection tests if an account's connection works
func (s *MailService) TestConnection(accountID string) error {
	account, err := s.accountService.GetAccount(accountID)
	if err != nil {
		return err
	}

	c, err := ConnectIMAP(account)
	if err != nil {
		return err
	}
	defer c.Close()

	return c.Noop()
}

// formatAddress formats an address list to string
func formatAddress(addrs []*imap.Address) string {
	if len(addrs) == 0 {
		return ""
	}
	return addrs[0].Address()
}

// formatAddressList formats multiple addresses
func formatAddressList(addrs []*imap.Address) []string {
	result := make([]string, 0, len(addrs))
	for _, addr := range addrs {
		if addr != nil && addr.Address() != "" {
			result = append(result, addr.Address())
		}
	}
	return result
}

// extractTextBody extracts plain text from HTML
func extractTextBody(html string) string {
	// Remove HTML tags
	re := regexp.MustCompile(`<[^>]*>`)
	text := re.ReplaceAllString(html, "")

	// Replace entities
	text = strings.ReplaceAll(text, "&nbsp;", " ")
	text = strings.ReplaceAll(text, "&amp;", "&")
	text = strings.ReplaceAll(text, "&lt;", "<")
	text = strings.ReplaceAll(text, "&gt;", ">")
	text = strings.ReplaceAll(text, "&quot;", "\"")

	return strings.TrimSpace(text)
}
