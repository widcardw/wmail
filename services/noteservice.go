package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Note represents a note with TipTap content
type Note struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"` // TipTap JSON content
	Preview   string `json:"preview"` // Short preview text
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
	Folder    string `json:"folder"` // Folder name this note belongs to
}

// NoteFolder represents a folder containing notes
type NoteFolder struct {
	Name      string  `json:"name"`
	Path      string  `json:"path"` // Full path to the folder
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

// NoteConfig represents the notes configuration
type NoteConfig struct {
	DefaultDir    string   `json:"defaultDir"`
}

// NoteService manages notes and folders
type NoteService struct {
	config     NoteConfig
	configPath string
	mu         sync.RWMutex
}

// NewNoteService creates a new note service
func NewNoteService() *NoteService {
	configDir, err := getUserConfigDir()
	if err != nil {
		fmt.Printf("[NoteService] Failed to get config dir: %v\n", err)
		configDir = os.TempDir()
	}

	configPath := filepath.Join(configDir, "wmail", "notes_config.json")
	defaultDir := filepath.Join(configDir, "wmail", "notes")
	service := &NoteService{
		configPath: configPath,
		config: NoteConfig{
			DefaultDir: defaultDir,
		},
	}

	// Load existing config or create default
	if err := service.loadConfig(); err != nil {
		fmt.Printf("[NoteService] Creating default config\n")
		if err := service.saveConfig(); err != nil {
			fmt.Printf("[NoteService] Failed to save config: %v\n", err)
		}
	}

	// Ensure default directory exists
	if err := os.MkdirAll(defaultDir, 0755); err != nil {
		fmt.Printf("[NoteService] Failed to create default dir: %v\n", err)
	}

	// Ensure Default folder exists
	defaultFolder := filepath.Join(defaultDir, "Default")
	if err := os.MkdirAll(defaultFolder, 0755); err != nil {
		fmt.Printf("[NoteService] Failed to create Default folder: %v\n", err)
	}

	return service
}

// loadConfig loads the configuration from file
func (s *NoteService) loadConfig() error {
	data, err := os.ReadFile(s.configPath)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &s.config)
}

// saveConfig saves the configuration to file
func (s *NoteService) saveConfig() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.MarshalIndent(s.config, "", "  ")
	if err != nil {
		return err
	}

	// Ensure config directory exists
	if err := os.MkdirAll(filepath.Dir(s.configPath), 0755); err != nil {
		return err
	}

	return os.WriteFile(s.configPath, data, 0644)
}

// GetConfig returns the current configuration
func (s *NoteService) GetConfig() NoteConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.config
}

// SetDefaultDir sets the default directory for notes
func (s *NoteService) SetDefaultDir(dir string) error {
	s.mu.Lock()
	s.config.DefaultDir = dir
	s.mu.Unlock()

	// Ensure directory exists
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	return s.saveConfig()
}

// GetFolders returns all note folders
func (s *NoteService) GetFolders() ([]NoteFolder, error) {
	entries, err := os.ReadDir(s.config.DefaultDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read notes directory: %w", err)
	}

	var folders []NoteFolder
	for _, entry := range entries {
		if entry.IsDir() {
			info, err := entry.Info()
			if err != nil {
				continue
			}
			folderPath := filepath.Join(s.config.DefaultDir, entry.Name())
			folder := NoteFolder{
				Name:      entry.Name(),
				Path:      folderPath,
				CreatedAt: info.ModTime().Format(time.RFC3339),
				UpdatedAt: info.ModTime().Format(time.RFC3339),
			}
			folders = append(folders, folder)
		}
	}

	return folders, nil
}

// CreateFolder creates a new note folder
func (s *NoteService) CreateFolder(name string) error {
	if name == "" {
		return fmt.Errorf("folder name cannot be empty")
	}

	folderPath := filepath.Join(s.config.DefaultDir, name)
	if err := os.MkdirAll(folderPath, 0755); err != nil {
		return fmt.Errorf("failed to create folder: %w", err)
	}

	return nil
}

// DeleteFolder deletes a note folder and all its notes
func (s *NoteService) DeleteFolder(name string) error {
	folderPath := filepath.Join(s.config.DefaultDir, name)
	if err := os.RemoveAll(folderPath); err != nil {
		return fmt.Errorf("failed to delete folder: %w", err)
	}
	return nil
}

// GetNotes returns all notes in a folder
func (s *NoteService) GetNotes(folder string) ([]Note, error) {
	folderPath := filepath.Join(s.config.DefaultDir, folder)
	entries, err := os.ReadDir(folderPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read folder: %w", err)
	}

	var notes []Note
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".json" {
			notePath := filepath.Join(folderPath, entry.Name())
			note, err := s.loadNote(notePath)
			if err != nil {
				fmt.Printf("[NoteService] Failed to load note %s: %v\n", entry.Name(), err)
				continue
			}
			notes = append(notes, *note)
		}
	}

	// Sort by updated time (newest first)
	sortNotesByTime(notes)

	return notes, nil
}

// GetNote returns a specific note by ID
func (s *NoteService) GetNote(folder, noteID string) (*Note, error) {
	notePath := filepath.Join(s.config.DefaultDir, folder, noteID+".json")
	return s.loadNote(notePath)
}

// SaveNote saves or updates a note
func (s *NoteService) SaveNote(folder string, note Note) error {
	if note.ID == "" {
		note.ID = generateUUID()
		note.CreatedAt = getCurrentTime()
	}

	// Use "Default" folder if not specified
	if folder == "" {
		folder = "Default"
	}

	note.Folder = folder
	note.UpdatedAt = getCurrentTime()

	// Extract title from content (first line)
	note.Title = extractTitle(note.Content)

	// Extract preview text
	note.Preview = extractPreview(note.Content, 100)

	folderPath := filepath.Join(s.config.DefaultDir, folder)
	if err := os.MkdirAll(folderPath, 0755); err != nil {
		return fmt.Errorf("failed to create folder: %w", err)
	}

	notePath := filepath.Join(folderPath, note.ID+".json")
	return s.saveNote(notePath, note)
}

// DeleteNote deletes a note
func (s *NoteService) DeleteNote(folder, noteID string) error {
	notePath := filepath.Join(s.config.DefaultDir, folder, noteID+".json")
	if err := os.Remove(notePath); err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}
	return nil
}

// loadNote loads a note from file
func (s *NoteService) loadNote(path string) (*Note, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var note Note
	if err := json.Unmarshal(data, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

// saveNote saves a note to file
func (s *NoteService) saveNote(path string, note Note) error {
	data, err := json.MarshalIndent(note, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

// extractTitle extracts the title from TipTap content (first text node)
func extractTitle(content string) string {
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(content), &parsed); err != nil {
		return "Untitled"
	}

	// Extract first text content from TipTap JSON
	if contentMap, ok := parsed["content"].([]interface{}); ok && len(contentMap) > 0 {
		if firstNode, ok := contentMap[0].(map[string]interface{}); ok {
			// Check for text node in any block type (paragraph, heading, etc.)
			if children, ok := firstNode["content"].([]interface{}); ok && len(children) > 0 {
				if textNode, ok := children[0].(map[string]interface{}); ok {
					if text, ok := textNode["text"].(string); ok {
						if text != "" {
							return text
						}
					}
				}
			}
		}
	}

	return "Untitled"
}

// extractPreview extracts a short preview from TipTap content
func extractPreview(content string, maxLen int) string {
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(content), &parsed); err != nil {
		return ""
	}

	// Extract all text content from TipTap JSON
	text := extractAllText(parsed)
	if len(text) > maxLen {
		return text[:maxLen] + "..."
	}
	return text
}

// extractAllText recursively extracts all text from TipTap JSON
func extractAllText(node interface{}) string {
	var text string

	if m, ok := node.(map[string]interface{}); ok {
		if t, ok := m["text"].(string); ok {
			text += t
		}
		if content, ok := m["content"].([]interface{}); ok {
			for _, child := range content {
				text += extractAllText(child)
			}
		}
	} else if arr, ok := node.([]interface{}); ok {
		for _, item := range arr {
			text += extractAllText(item)
		}
	}

	return text
}

// sortNotesByTime sorts notes by updated time (newest first)
func sortNotesByTime(notes []Note) {
	for i := 0; i < len(notes); i++ {
		for j := i + 1; j < len(notes); j++ {
			timeI, _ := time.Parse(time.RFC3339, notes[i].UpdatedAt)
			timeJ, _ := time.Parse(time.RFC3339, notes[j].UpdatedAt)
			if timeJ.After(timeI) {
				notes[i], notes[j] = notes[j], notes[i]
			}
		}
	}
}
