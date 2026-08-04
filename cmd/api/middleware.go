package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

const (
	BASIC  = "Basic"
	BEARER = "Bearer"
)

func (app *application) BasicAuthMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			//read the auth header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				app.UnAuthorizedBasicError(w, r, fmt.Errorf("authorization header is missing"))
				return
			}
			//parse it -> base64
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != BASIC {
				app.UnAuthorizedBasicError(w, r, fmt.Errorf("authorization header is malformed"))
				return
			}
			//decode
			decoded, err := base64.StdEncoding.DecodeString(parts[1])
			if err != nil {
				app.UnAuthorizedBasicError(w, r, err)
				return
			}
			//check the credentials
			username := app.config.auth.basic.user
			password := app.config.auth.basic.password
			creds := strings.SplitN(string(decoded), ":", 2)
			if len(creds) != 2 || creds[0] != username || creds[1] != password {
				app.UnAuthorized(w, r, fmt.Errorf("invalid credentials"))
				return
			}

			next.ServeHTTP(w, r)
		})

	}
}

func (app *application) AuthTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//Fetch the header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.UnAuthorized(w, r, fmt.Errorf("unauthorized"))
			return
		}
		//parse the header
		parts := strings.Split(authHeader, " ") // authentication Bearer asdsadasdzxxxxx
		if len(parts) != 2 || parts[0] != BEARER {
			app.UnAuthorized(w, r, fmt.Errorf("unauthorized"))
			return
		}
		//validate
		jwtToken, err := app.authenticator.ValidateToken(parts[1])
		if err != nil {
			app.UnAuthorized(w, r, err)
			return
		}
		//parse the claims
		claims, _ := jwtToken.Claims.(jwt.MapClaims)
		//NOTE: convert to float to fix the JWT sub issue
		userID, err := strconv.ParseInt(fmt.Sprintf("%.f", claims["sub"]), 10, 64)
		if err != nil {
			app.UnAuthorized(w, r, err)
			return
		}

		ctx := r.Context()
		user, err := app.store.Users.GetByID(ctx, userID)
		if err != nil {
			app.UnAuthorized(w, r, err)
			return
		}
		ctx = context.WithValue(ctx, userCtx, user)
		//NOTE: TO send the user in the ctx we need to serve it with the handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
