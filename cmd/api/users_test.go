package main

import (
	"net/http"
	"testing"
)

func TestGetUser(t *testing.T) {
	app := newTestApplication(t)
	mux := app.mount()

	// Generate a JWT for user ID 1.
	// testToken, err := app.authenticator.GenerateToken(nil)
	// if err != nil {
	// 	t.Fatal(err)
	// }

	t.Run("should not allow unauthenticated request", func(t *testing.T) {
		req, err := http.NewRequest(
			http.MethodGet,
			"/v1/users/10/",
			nil,
		)
		if err != nil {
			t.Fatal(err)
		}

		rr := execReq(req, mux)

		checkResponseCode(t, http.StatusUnauthorized, rr.Code)
	})

	// 	t.Run("should allow authenticated request", func(t *testing.T) {
	// 		req, err := http.NewRequest(
	// 			http.MethodGet,
	// 			"/v1/users/10/",
	// 			nil,
	// 		)
	// 		if err != nil {
	// 			t.Fatal(err)
	// 		}
	//
	// 		req.Header.Set(
	// 			"Authorization",
	// 			"Bearer "+testToken,
	// 		)
	//
	// 		rr := execReq(req, mux)
	//
	// 		if rr.Code != http.StatusOK {
	// 			t.Logf("expected status: %d", http.StatusOK)
	// 			t.Logf("actual status: %d", rr.Code)
	// 			t.Logf("response body: %s", rr.Body.String())
	// 		}
	//
	// 		checkResponseCode(t, http.StatusOK, rr.Code)
	// 	})
}
