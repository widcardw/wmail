package services

import (
	"crypto/tls"
	"fmt"
	"io"
	// "log"
	"regexp"
	"strings"
	"time"

	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"github.com/emersion/go-message/mail"
)

// Email represents an email message
type Email struct {
	ID         string    `json:"id"`
	AccountID  string    `json:"accountId"`
	Folder     string    `json:"folder"`
	UID        uint32    `json:"uid"`
	From       string    `json:"from"`
	To         []string  `json:"to"`
	CC         []string  `json:"cc"`
	Subject    string    `json:"subject"`
	Date       string    `json:"date"`
	Body       string    `json:"body"`
	IsRead     bool      `json:"isRead"`
	IsStarred  bool      `json:"isStarred"`
	CreatedAt  string    `json:"createdAt"`
}

// Folder represents a mailbox folder
type Folder struct {
	Name       string `json:"name"`
	Unread     int    `json:"unread"`
	Total      int    `json:"total"`
}

// MailService handles email operations
type MailService struct {
	accountService *MailAccountService
}

// NewMailService creates a new mail service
func NewMailService(accountService *MailAccountService) *MailService {
	return &MailService{
		accountService: accountService,
	}
}

// GetFolders retrieves folders for an account
func (s *MailService) GetFolders(accountID string) ([]*Folder, error) {
	account, err := s.accountService.GetAccount(accountID)
	if err != nil {
		return nil, err
	}

	c, err := s.connectIMAP(account)
	if err != nil {
		return nil, err
	}
	defer c.Close()

	mailboxes := make(chan *imap.MailboxInfo, 10)
	done := make(chan error, 1)

	go func() {
		done <- c.List("", "*", mailboxes)
	}()

	var folders []*Folder

	for m := range mailboxes {
		folder := &Folder{
			Name: m.Name,
		}

		// Get folder status
		status, err := c.Status(m.Name, []imap.StatusItem{imap.StatusUnseen, imap.StatusMessages})
		if err == nil {
			folder.Unread = int(status.Unseen)
			folder.Total = int(status.Messages)
		}

		folders = append(folders, folder)
	}

	if err := <-done; err != nil {
		return nil, err
	}

	return folders, nil
}

// GetEmails retrieves emails from a folder
func (s *MailService) GetEmails(accountID, folder string, page, pageSize int) ([]*Email, error) {
	account, err := s.accountService.GetAccount(accountID)
	if err != nil {
		return nil, err
	}

	c, err := s.connectIMAP(account)
	if err != nil {
		return nil, err
	}
	defer c.Close()

	// Select mailbox
	mbox, err := c.Select(folder, false)
	if err != nil {
		return nil, err
	}

	// Calculate message range for pagination
	from := uint32(1)
	to := mbox.Messages
	if pageSize > 0 {
		if page > 0 {
			start := mbox.Messages - uint32((page-1)*pageSize)
			end := start - uint32(pageSize)
			if end < 1 {
				end = 1
			}
			from = end
			to = start
		} else {
			to = uint32(pageSize)
		}
	}

	// Get message sequence set
	seqset := new(imap.SeqSet)
	seqset.AddRange(from, to)

	// Get messages
	messages := make(chan *imap.Message, pageSize)
	done := make(chan error, 1)

	go func() {
		done <- c.Fetch(seqset, []imap.FetchItem{
			imap.FetchEnvelope,
			imap.FetchRFC822Header,
			imap.FetchBodyStructure,
			imap.FetchUid,
		}, messages)
	}()

	var emails []*Email

	for msg := range messages {
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
			CreatedAt: getCurrentTime(),
		}

		emails = append(emails, email)
	}

	if err := <-done; err != nil {
		return nil, err
	}

	return emails, nil
}

// GetEmail retrieves a specific email with body
func (s *MailService) GetEmail(accountID, folder string, uid uint32) (*Email, error) {
	account, err := s.accountService.GetAccount(accountID)
	if err != nil {
		return nil, err
	}

	c, err := s.connectIMAP(account)
	if err != nil {
		return nil, err
	}
	defer c.Close()

	// Select mailbox
	if _, err := c.Select(folder, false); err != nil {
		return nil, err
	}

	// Get message sequence set
	seqset := new(imap.SeqSet)
	seqset.AddNum(uid)

	// Get message body - fetch the first part (typically the plain text body)
	section := &imap.BodySectionName{
		BodyPartName: imap.BodyPartName{
			Path:       []int{1},
			Specifier:  imap.EntireSpecifier,
		},
	}
	items := []imap.FetchItem{
		imap.FetchEnvelope,
		imap.FetchUid,
		section.FetchItem(),
	}

	messages := make(chan *imap.Message, 1)
	if err := c.Fetch(seqset, items, messages); err != nil {
		return nil, err
	}

	msg := <-messages
	if msg == nil {
		return nil, fmt.Errorf("message not found")
	}

	// Parse message
	r := msg.GetBody(section)
	if r == nil {
		return nil, fmt.Errorf("no body found")
	}

	mr, err := mail.CreateReader(r)
	if err != nil {
		return nil, err
	}

	var body strings.Builder

	for {
		p, err := mr.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		switch p.Header.(type) {
		case *mail.InlineHeader:
			if _, err := io.Copy(&body, p.Body); err != nil {
				return nil, err
			}
		}
	}

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
		Body:      body.String(),
		IsRead:    true,
		CreatedAt: getCurrentTime(),
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

	// Authenticate
	if err := c.Login(account.Username, account.Password); err != nil {
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

	c, err := s.connectIMAP(account)
	if err != nil {
		return err
	}
	defer c.Close()

	return c.Noop()
}

// connectIMAP connects to IMAP server
func (s *MailService) connectIMAP(account *Account) (*client.Client, error) {
	var c *client.Client
	var err error

	if account.IMAPUseSSL {
		c, err = client.DialTLS(
			fmt.Sprintf("%s:%d", account.IMAPHost, account.IMAPPort),
			&tls.Config{InsecureSkipVerify: true},
		)
	} else {
		c, err = client.Dial(fmt.Sprintf("%s:%d", account.IMAPHost, account.IMAPPort))
	}

	if err != nil {
		return nil, err
	}

	// Login
	if err := c.Login(account.Username, account.Password); err != nil {
		c.Close()
		return nil, err
	}

	return c, nil
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
