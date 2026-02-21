package services

import (
	"database/sql"
	"fmt"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

// EmailCache handles email caching in SQLite
type EmailCache struct {
	db   *sql.DB
	lock sync.RWMutex
}

// NewEmailCache creates a new email cache
func NewEmailCache(dbPath string) (*EmailCache, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Enable WAL mode for better concurrent access
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		return nil, fmt.Errorf("failed to enable WAL mode: %w", err)
	}

	// Create tables
	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	return &EmailCache{db: db}, nil
}

func createTables(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS emails (
			id TEXT PRIMARY KEY,
			account_id TEXT NOT NULL,
			folder TEXT NOT NULL,
			uid INTEGER NOT NULL,
			from_addr TEXT,
			to_addresses TEXT,
			cc_addresses TEXT,
			subject TEXT,
			date TEXT,
			body TEXT,
			is_read INTEGER DEFAULT 0,
			is_starred INTEGER DEFAULT 0,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			UNIQUE(account_id, folder, uid)
		);

		CREATE INDEX IF NOT EXISTS idx_emails_account_folder ON emails(account_id, folder);
		CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date DESC);
		CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);
	`)
	return err
}

// CacheEmails caches multiple emails
func (c *EmailCache) CacheEmails(emails []*Email) error {
	c.lock.Lock()
	defer c.lock.Unlock()

	tx, err := c.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	now := getCurrentTime()

	stmt, err := tx.Prepare(`
		INSERT OR REPLACE INTO emails 
		(id, account_id, folder, uid, from_addr, to_addresses, cc_addresses, subject, date, body, is_read, is_starred, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, email := range emails {
		toAddrs := ""
		for i, addr := range email.To {
			if i > 0 {
				toAddrs += ","
			}
			toAddrs += addr
		}

		ccAddrs := ""
		for i, addr := range email.CC {
			if i > 0 {
				ccAddrs += ","
			}
			ccAddrs += addr
		}

		isRead := 0
		if email.IsRead {
			isRead = 1
		}

		isStarred := 0
		if email.IsStarred {
			isStarred = 1
		}

		_, err := stmt.Exec(
			email.ID,
			email.AccountID,
			email.Folder,
			email.UID,
			email.From,
			toAddrs,
			ccAddrs,
			email.Subject,
			email.Date,
			email.Body,
			isRead,
			isStarred,
			email.CreatedAt,
			now,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetCachedEmails retrieves cached emails for an account folder
func (c *EmailCache) GetCachedEmails(accountID, folder string, page, pageSize int) ([]*Email, error) {
	c.lock.RLock()
	defer c.lock.RUnlock()

	offset := (page - 1) * pageSize
	if offset < 0 {
		offset = 0
	}

	query := `
		SELECT id, account_id, folder, uid, from_addr, to_addresses, cc_addresses, 
		       subject, date, body, is_read, is_starred, created_at
		FROM emails
		WHERE account_id = ? AND folder = ?
		ORDER BY date DESC
		LIMIT ? OFFSET ?
	`

	rows, err := c.db.Query(query, accountID, folder, pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var emails []*Email
	for rows.Next() {
		var email Email
		var toAddrs, ccAddrs string
		var isRead, isStarred int

		err := rows.Scan(
			&email.ID,
			&email.AccountID,
			&email.Folder,
			&email.UID,
			&email.From,
			&toAddrs,
			&ccAddrs,
			&email.Subject,
			&email.Date,
			&email.Body,
			&isRead,
			&isStarred,
			&email.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		email.IsRead = isRead == 1
		email.IsStarred = isStarred == 1

		// Parse addresses
		email.To = parseAddresses(toAddrs)
		email.CC = parseAddresses(ccAddrs)

		emails = append(emails, &email)
	}

	return emails, nil
}

// GetCachedEmail retrieves a single cached email
func (c *EmailCache) GetCachedEmail(emailID string) (*Email, error) {
	c.lock.RLock()
	defer c.lock.RUnlock()

	query := `
		SELECT id, account_id, folder, uid, from_addr, to_addresses, cc_addresses, 
		       subject, date, body, is_read, is_starred, created_at
		FROM emails
		WHERE id = ?
	`

	row := c.db.QueryRow(query, emailID)

	var email Email
	var toAddrs, ccAddrs string
	var isRead, isStarred int

	err := row.Scan(
		&email.ID,
		&email.AccountID,
		&email.Folder,
		&email.UID,
		&email.From,
		&toAddrs,
		&ccAddrs,
		&email.Subject,
		&email.Date,
		&email.Body,
		&isRead,
		&isStarred,
		&email.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	email.IsRead = isRead == 1
	email.IsStarred = isStarred == 1
	email.To = parseAddresses(toAddrs)
	email.CC = parseAddresses(ccAddrs)

	return &email, nil
}

// UpdateEmailBody updates the body of an email
func (c *EmailCache) UpdateEmailBody(emailID, body string) error {
	c.lock.Lock()
	defer c.lock.Unlock()

	_, err := c.db.Exec(`
		UPDATE emails SET body = ?, updated_at = ? WHERE id = ?
	`, body, getCurrentTime(), emailID)

	return err
}

// MarkAsRead marks an email as read
func (c *EmailCache) MarkAsRead(emailID string) error {
	c.lock.Lock()
	defer c.lock.Unlock()

	_, err := c.db.Exec(`
		UPDATE emails SET is_read = 1, updated_at = ? WHERE id = ?
	`, getCurrentTime(), emailID)

	return err
}

// MarkAsStarred marks an email as starred
func (c *EmailCache) MarkAsStarred(emailID string, starred bool) error {
	c.lock.Lock()
	defer c.lock.Unlock()

	isStarred := 0
	if starred {
		isStarred = 1
	}

	_, err := c.db.Exec(`
		UPDATE emails SET is_starred = ?, updated_at = ? WHERE id = ?
	`, isStarred, getCurrentTime(), emailID)

	return err
}

// DeleteEmails deletes cached emails for an account folder
func (c *EmailCache) DeleteEmails(accountID, folder string) error {
	c.lock.Lock()
	defer c.lock.Unlock()

	_, err := c.db.Exec(`
		DELETE FROM emails WHERE account_id = ? AND folder = ?
	`, accountID, folder)

	return err
}

// GetCachedCount returns the count of cached emails for an account folder
func (c *EmailCache) GetCachedCount(accountID, folder string) (int, error) {
	c.lock.RLock()
	defer c.lock.RUnlock()

	var count int
	err := c.db.QueryRow(`
		SELECT COUNT(*) FROM emails WHERE account_id = ? AND folder = ?
	`, accountID, folder).Scan(&count)

	return count, err
}

// Close closes the database connection
func (c *EmailCache) Close() error {
	return c.db.Close()
}

func parseAddresses(s string) []string {
	if s == "" {
		return []string{}
	}
	// Simple comma-separated parsing
	var result []string
	start := 0
	for i, r := range s {
		if r == ',' {
			result = append(result, s[start:i])
			start = i + 1
		}
	}
	result = append(result, s[start:])
	return result
}
