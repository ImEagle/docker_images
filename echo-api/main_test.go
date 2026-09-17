package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealth(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	response := httptest.NewRecorder()

	newHandler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
}

func TestEchoReturnsRequestDetails(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/api/echo?ignored=query", strings.NewReader("hello, echo"))
	request.Header.Add("X-Request-ID", "first")
	request.Header.Add("X-Request-ID", "second")
	request.Header.Set("Content-Type", "text/plain")
	response := httptest.NewRecorder()

	newHandler().ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if contentType := response.Header().Get("Content-Type"); contentType != "application/json" {
		t.Fatalf("Content-Type = %q, want application/json", contentType)
	}

	var got echoResponse
	if err := json.NewDecoder(response.Body).Decode(&got); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if got.Method != http.MethodPost {
		t.Errorf("method = %q, want %q", got.Method, http.MethodPost)
	}
	if got.Path != "/api/echo" {
		t.Errorf("path = %q, want /api/echo", got.Path)
	}
	if got.Body != "hello, echo" {
		t.Errorf("body = %q, want %q", got.Body, "hello, echo")
	}
	if values := got.Headers.Values("X-Request-ID"); len(values) != 2 || values[0] != "first" || values[1] != "second" {
		t.Errorf("X-Request-ID = %q, want [first second]", values)
	}
}

func TestUnknownPathReturnsNotFound(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/missing", nil)
	response := httptest.NewRecorder()

	newHandler().ServeHTTP(response, request)

	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNotFound)
	}
}
