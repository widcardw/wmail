package services

import (
	"crypto/tls"
	"fmt"
	"os"
	"time"

	"github.com/emersion/go-imap/client"
	"github.com/google/uuid"
)

// generateUUID generates a unique ID
func generateUUID() string {
	return uuid.New().String()
}

// getCurrentTime returns the current time in RFC3339 format
func getCurrentTime() string {
	return time.Now().Format(time.RFC3339)
}

// getUserConfigDir returns the user config directory
func getUserConfigDir() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = os.TempDir()
	}
	return configDir, nil
}

// ConnectIMAP connects to an IMAP server
func ConnectIMAP(account *Account) (*client.Client, error) {
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

	username := account.Username
	if username == "" {
		username = account.Email
	}
	if err := c.Login(username, account.Password); err != nil {
		c.Close()
		return nil, err
	}

	return c, nil
}
