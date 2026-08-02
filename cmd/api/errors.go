package main

import (
	"net/http"
)

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

func (app *application) Conflict(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Errorw("conflict", "method", r.Method, "path", r.URL.Path, err.Error())
	WriteJsonError(w, http.StatusConflict, err.Error())
}
