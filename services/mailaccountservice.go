package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// Account represents an email account configuration
type Account struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	IMAPHost    string `json:"imapHost"`
	IMAPPort    int    `json:"imapPort"`
	IMAPUseSSL  bool   `json:"imapUseSSL"`
	SMTPHost    string `json:"smtpHost"`
	SMTPPort    int    `json:"smtpPort"`
	SMTPUseSSL  bool   `json:"smtpUseSSL"`
	Username    string `json:"username"`
	Password    string `json:"password"` // In production, this should be encrypted
	CreatedAt   string `json:"createdAt"`
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
	s.accountsMutex.Lock()
	defer s.accountsMutex.Unlock()
	
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
	
	for _, acc := range accounts {
		s.accounts[acc.ID] = acc
	}
	
	return nil
}

// saveAccounts saves accounts to file
func (s *MailAccountService) saveAccounts() error {
	s.accountsMutex.RLock()
	defer s.accountsMutex.RUnlock()
	
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
	s.accountsMutex.Unlock()
	
	if err := s.saveAccounts(); err != nil {
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
	
	delete(s.accounts, id)
	return s.saveAccounts()
}
