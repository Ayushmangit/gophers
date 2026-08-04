package main

import (
	"net/http"
)

func (app *application) UnAuthorizedBasicError(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Errorw("unauthorized basic error", "method", r.Method, "path", r.URL.Path, "error", err.Error())
	w.Header().Set("WWW-Authenticate", `Basic realm="restricted",charset="UTF-8"`)
	WriteJsonError(w, http.StatusUnauthorized, "unauthorized")
}

func (app *application) UnAuthorized(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Errorw("unauthorized error", "method", r.Method, "path", r.URL.Path, "error", err.Error())
	WriteJsonError(w, http.StatusUnauthorized, "unauthorized")
}

func (app *application) InternalServerError(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Errorw("internal error", "method", r.Method, "path", r.URL.Path, "error", err.Error())
	WriteJsonError(w, http.StatusInternalServerError, "the server encountered a problem")
}

func (app *application) BadRequest(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnf("bad request", "method", r.Method, "path", r.URL.Path, err.Error())
	WriteJsonError(w, http.StatusBadRequest, err.Error())
}

func (app *application) NotFound(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnf("not found", "method", r.Method, "path", r.URL.Path, err.Error())
	WriteJsonError(w, http.StatusNotFound, "not found")
}

func (app *application) ForbiddenResponse(w http.ResponseWriter, r *http.Request) {
	app.logger.Warnf("forbidden", "method", r.Method, "path", r.URL.Path)
	WriteJsonError(w, http.StatusForbidden, "not found")
}

func (app *application) Conflict(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Errorw("conflict", "method", r.Method, "path", r.URL.Path, err.Error())
	WriteJsonError(w, http.StatusConflict, err.Error())
}
