package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
)

// UserDetails represents the form data
type UserDetails struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	Company     string `json:"company"`
	Department  string `json:"department"`
	PhoneNumber string `json:"phoneNumber"`
}

// AugmentedDetails represents the response from the second server
type AugmentedDetails struct {
	UserDetails
	ProcessedAt   string `json:"processedAt"`
	ProcessingID  string `json:"processingId"`
	ServerVersion string `json:"serverVersion"`
}

func main() {
	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	// Handle routes
	http.HandleFunc("/", handleHome)
	http.HandleFunc("/submit", handleSubmit)

	fmt.Println("First application starting on :8080")
	fmt.Println("Make sure to create the following directory structure:")
	fmt.Println("  ./static/")
	fmt.Println("  ./static/css/styles.css")
	fmt.Println("  ./static/js/main.js")
	fmt.Println("  ./templates/index.html")

	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, filepath.Join("templates", "index.html"))
}

func handleSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var userDetails UserDetails
	if err := json.NewDecoder(r.Body).Decode(&userDetails); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Forward to second application
	jsonData, err := json.Marshal(userDetails)
	if err != nil {
		http.Error(w, "Error processing data", http.StatusInternalServerError)
		return
	}

	// Send to second application
	resp, err := http.Post("http://localhost:8081/process", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		http.Error(w, "Error connecting to processing server", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// Read augmented response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Error reading response", http.StatusInternalServerError)
		return
	}

	// Forward the augmented response back to client
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
