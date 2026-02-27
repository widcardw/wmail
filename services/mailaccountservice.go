package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/emersion/go-imap"
)

// Account represents an email account configuration
type Account struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Email      string   `json:"email"`
	IMAPHost   string   `json:"imapHost"`
	IMAPPort   int      `json:"imapPort"`
	IMAPUseSSL bool     `json:"imapUseSSL"`
	SMTPHost   string   `json:"smtpHost"`
	SMTPPort   int      `json:"smtpPort"`
	SMTPUseSSL bool     `json:"smtpUseSSL"`
	Username   string   `json:"username"`
	Password   string   `json:"password"` // In production, this should be encrypted
	CreatedAt  string   `json:"createdAt"`
	Folders    []Folder `json:"folders"`
}

// MailAccountService manages email accounts
type MailAccountService struct {
	accounts      map[string]*Account
	accountsMutex sync.RWMutex
	accountsPath  string
}

// NewMailAccountService creates a new account service
func NewMailAccountService() *MailAccountService {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = os.TempDir()
	}

	appDir := filepath.Join(configDir, "wmail")
	os.MkdirAll(appDir, 0755)

	accountsPath := filepath.Join(appDir, "accounts.json")

	s := &MailAccountService{
		accounts:     make(map[string]*Account),
		accountsPath: accountsPath,
	}

	s.loadAccounts()
	return s
}

// loadAccounts loads accounts from file
func (s *MailAccountService) loadAccounts() error {
	data, err := os.ReadFile(s.accountsPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	var accounts []*Account
	if err := json.Unmarshal(data, &accounts); err != nil {
		return err
	}

	s.accountsMutex.Lock()
	defer s.accountsMutex.Unlock()

	var infoChanged = false
	for _, acc := range accounts {
		s.accounts[acc.ID] = acc
		if len(acc.Folders) == 0 {
			folders, err := s.fetchFoldersForAccount(acc)
			if err == nil {
				acc.Folders = folders
			}
			infoChanged = true
		}
	}
	
	if infoChanged {
		s.saveAccounts()
	}

	return nil
}

// saveAccounts saves accounts to file
// Note: This function does NOT acquire a lock - caller must hold the appropriate lock
func (s *MailAccountService) saveAccounts() error {
	accounts := make([]*Account, 0, len(s.accounts))
	for _, acc := range s.accounts {
		accounts = append(accounts, acc)
	}

	data, err := json.MarshalIndent(accounts, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.accountsPath, data, 0600)
}

// GetAccounts returns all accounts
func (s *MailAccountService) GetAccounts() []*Account {
	s.accountsMutex.RLock()
	defer s.accountsMutex.RUnlock()

	accounts := make([]*Account, 0, len(s.accounts))
	for _, acc := range s.accounts {
		accounts = append(accounts, acc)
	}
	return accounts
}

// GetAccount returns an account by ID
func (s *MailAccountService) GetAccount(id string) (*Account, error) {
	s.accountsMutex.RLock()
	defer s.accountsMutex.RUnlock()

	acc, exists := s.accounts[id]
	if !exists {
		return nil, fmt.Errorf("account not found")
	}
	return acc, nil
}

// AddAccount adds a new account
func (s *MailAccountService) AddAccount(account *Account) (*Account, error) {
	if account.ID == "" {
		account.ID = generateUUID()
	}
	if account.CreatedAt == "" {
		account.CreatedAt = getCurrentTime()
	}

	s.accountsMutex.Lock()
	s.accounts[account.ID] = account
	err := s.saveAccounts()
	s.accountsMutex.Unlock()

	if err != nil {
		return nil, err
	}

	return account, nil
}

// UpdateAccount updates an existing account
func (s *MailAccountService) UpdateAccount(account *Account) error {
	s.accountsMutex.Lock()
	defer s.accountsMutex.Unlock()

	if _, exists := s.accounts[account.ID]; !exists {
		return fmt.Errorf("account not found")
	}

	s.accounts[account.ID] = account

	return s.saveAccounts()
}

// DeleteAccount deletes an account
func (s *MailAccountService) DeleteAccount(id string) error {
	s.accountsMutex.Lock()
	defer s.accountsMutex.Unlock()

	if _, exists := s.accounts[id]; !exists {
		return fmt.Errorf("account not found")
	}

	fmt.Println("Before delete")
	delete(s.accounts, id)
	fmt.Println("After delete")
	return s.saveAccounts()
}

// GetFolders retrieves folders for an account
func (s *MailAccountService) GetFolders(accountID string) ([]*Folder, error) {
	account, err := s.GetAccount(accountID)
	if err != nil {
		return nil, err
	}

	c, err := ConnectIMAP(account)
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

// SyncFolders fetches and saves folders for an account
func (s *MailAccountService) SyncFolders(accountID string) error {
	folders, err := s.GetFolders(accountID)
	if err != nil {
		return err
	}

	s.accountsMutex.Lock()
	defer s.accountsMutex.Unlock()

	acc, exists := s.accounts[accountID]
	if !exists {
		return fmt.Errorf("account not found")
	}

	acc.Folders = make([]Folder, len(folders))
	for i, f := range folders {
		acc.Folders[i] = Folder{
			Name:   f.Name,
			Unread: f.Unread,
			Total:  f.Total,
		}
	}
	return s.saveAccounts()
}

// fetchFoldersForAccount fetches folders for an account without modifying the map
func (s *MailAccountService) fetchFoldersForAccount(account *Account) ([]Folder, error) {
	c, err := ConnectIMAP(account)
	if err != nil {
		return nil, err
	}
	defer c.Close()

	mailboxes := make(chan *imap.MailboxInfo, 10)
	done := make(chan error, 1)

	go func() {
		done <- c.List("", "*", mailboxes)
	}()

	var folders []Folder

	for m := range mailboxes {
		folder := Folder{
			Name: m.Name,
		}

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
