package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"time"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type SendGridMailer struct {
	fromEmail string
	client    *sendgrid.Client
	apiKey    string
}

func NewSendGridMailer(apikey, fromEmail string) *SendGridMailer {
	client := sendgrid.NewSendClient(apikey)
	return &SendGridMailer{
		fromEmail: fromEmail,
		apiKey:    apikey,
		client:    client,
	}
}

func (m *SendGridMailer) Send(templateFile, username, email string, data any, isSandbox bool) error {
	from := mail.NewEmail(FromName, m.fromEmail)
	to := mail.NewEmail(username, email)

	//template parsing
	tmpl, err := template.ParseFS(FS, "templates/"+templateFile)
	if err != nil {
		return err
	}

	subject := new(bytes.Buffer)
	err = tmpl.ExecuteTemplate(subject, "subject", data)
	if err != nil {
		return err
	}
	body := new(bytes.Buffer)
	err = tmpl.ExecuteTemplate(body, "body", data)
	if err != nil {
		return err
	}

	message := mail.NewSingleEmail(from, subject.String(), to, "", body.String())
	message.SetMailSettings(&mail.MailSettings{
		SandboxMode: &mail.Setting{
			Enable: &isSandbox,
		},
	})

	for i := range maxRetries {
		res, err := m.client.Send(message)
		if err != nil {
			log.Printf("failed to send email to %v, attempt %d of %d", email, i+1, maxRetries)
			log.Printf("error : %v", err.Error())

			//exponential backoff
			time.Sleep(time.Second * time.Duration(i+1))
			continue
		}
		if res.StatusCode >= 300 {
			return fmt.Errorf("sendgrid status=%d body=%s", res.StatusCode, res.Body)
		}
		log.Printf("Email sent with status code %v", res.StatusCode)
		return nil
	}
	return fmt.Errorf("failed to send email after %d attempts", maxRetries)

}
