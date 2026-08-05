package main

import (
	"net/http"
	"testing"
)

func TestGetUser(t *testing.T) {
	app := newTestApplication(t)
	mux := app.mount()

	testToken, err := app.authenticator.GenerateToken(nil)
	if err != nil {
		t.Fatal(err)
	}
	// t.Run("should not allow unauthenticated req", func(t *testing.T) {
	// 	//check for 401
	// 	req, err := http.NewRequest(http.MethodGet, "/v1/users/125", nil)
	// 	if err != nil {
	// 		t.Fatal(err)
	// 	}
	// 	rr := execReq(req, mux)
	// 	checkResponseCode(t, http.StatusUnauthorized, rr.Code)
	// })

	t.Run("should allow authenticated request", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodGet, "/v1/users/1", nil)
		if err != nil {
			t.Fatal(err)
		}
		req.Header.Set("Authorization", "Bearer "+testToken)
		rr := execReq(req, mux)
		checkResponseCode(t, http.StatusOK, rr.Code)
	})
}
