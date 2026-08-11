package main

import (
	"expvar"
	"runtime"
	"time"

	"github.com/Ayushmangit/social/internal/auth"
	"github.com/Ayushmangit/social/internal/db"
	"github.com/Ayushmangit/social/internal/env"
	"github.com/Ayushmangit/social/internal/mailer"
	"github.com/Ayushmangit/social/internal/ratelimiter"
	"github.com/Ayushmangit/social/internal/store"
	"github.com/Ayushmangit/social/internal/store/cache"
	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

const version = "1.1.5" // semver
const TIMEFRAME_RATELIMITER = time.Second * 5

//	@title			GopherSocial API
//	@description	API for GopherSocial , a social network for gophers
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

//	@BasePath					/v1
//
//	@securityDefinitions.apikey	ApiKeyAuth
//	@in							header
//	@name						Authorization
//	@description

func main() {
	cfg := config{
		addr:        env.GetString("ADDR", ":8080"),
		apiURL:      env.GetString("EXTERNAL_URL", "localhost:8080"),
		frontendURL: env.GetString("FRONTEND_URL", "http://localhost:5173"),
		db: dbConfig{
			addr:         env.GetString("DB_ADDR", "postgres://admin:adminpassword@localhost/social?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},
		redis: redisConfig{
			addr:    env.GetString("REDIS_ADDR", ""),
			db:      env.GetInt("REDIS_DB", 0),
			pw:      env.GetString("REDIS_PASSWORD", ""),
			enabled: env.GetBool("REDIS_ENABLED", true),
		},

		env: env.GetString("ENV", "development"),
		mail: mailConfig{
			exp:       time.Hour * 24 * 3, //3 days
			fromEmail: env.GetString("FROM_EMAIL", ""),
			sendGrid: sendGridConfig{
				apiKey: env.GetString("SENDGRID_API_KEY", ""),
			},
		},
		auth: authConfig{
			basic: basicConfig{
				user:     env.GetString("AUTH_BASIC_USERNAME", "admin"),
				password: env.GetString("AUTH_BASIC_PASSWORD", "admin"),
			},
			token: tokenConfig{
				secret: env.GetString("JWT_SECRET", "asdhpasdhfgljkdshfjashdf"),
				exp:    time.Hour * 24 * 3, //3 days,
				iss:    env.GetString("TOKEN_HOST", "Gophersocial"),
				aud:    env.GetString("TOKEN_HOST", "Gophersocial"),
			},
		},
		ratelimiter: ratelimiter.Config{
			RequestPerTimeFrame: env.GetInt("RATELIMITER_REQ_COUNT", 10),
			TimeFrame:           TIMEFRAME_RATELIMITER,
			Enabled:             env.GetBool("RATELIMITER_ENABLED", true),
		},
	}

	//Logger
	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync() // flushes any buffered logs entries

	//Database
	db, err := db.New(cfg.db.addr, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()
	logger.Info("database connection is established")

	store := store.NewStorage(db)
	//NOTE: mailer consume
	mailer := mailer.NewSendGridMailer(cfg.mail.sendGrid.apiKey, cfg.mail.fromEmail)
	jwtAuthenticator := auth.NewJWTAuthenticator(cfg.auth.token.secret, cfg.auth.token.aud, cfg.auth.token.iss)

	//NOTE: REDIS
	var rdb *redis.Client
	if cfg.redis.enabled {
		rdb = cache.NewRedisClient(cfg.redis.addr, cfg.redis.pw, cfg.redis.db)
		logger.Info("redis cache connection estd")
	}
	cacheStorage := cache.NewRedisStorage(rdb)

	rateLimiter := ratelimiter.NewFixedWindowLimiter(
		cfg.ratelimiter.RequestPerTimeFrame,
		cfg.ratelimiter.TimeFrame,
	)
	app := &application{
		config:        cfg,
		store:         store,
		cacheStorage:  cacheStorage,
		logger:        logger,
		mailer:        mailer,
		authenticator: jwtAuthenticator,
		rateLimiter:   rateLimiter,
	}

	//Metrics collected
	expvar.NewString("version").Set(version)
	expvar.Publish("database", expvar.Func(func() any {
		return db.Stats()
	}))
	expvar.Publish("goroutines", expvar.Func(func() any {
		return runtime.NumGoroutine()
	}))

	mux := app.mount()
	logger.Fatal(app.run(mux))
}
