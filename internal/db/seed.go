package db

import (
	"context"
	"database/sql"
	"log"
	"math/rand"

	"github.com/Ayushmangit/social/internal/store"
)

var usernames = []string{"shadowfox01", "codewizard02", "pixelhunter03", "ironclaw04", "nightowl05", "swiftcoder06", "stormrider07", "quantum08", "blazefury09", "lunarwolf10", "cyberhawk11", "echonova12", "silentbyte13", "rapidviper14", "frostknight15", "neonphantom16", "redphoenix17", "voidwalker18", "steelraven19", "cryptic20", "darkmatter21", "flashbolt22", "goldenspark23", "hypernova24", "infinite25", "jadefalcon26", "kingcobra27", "lightning28", "midnight29", "northstar30", "omega31", "phoenixfire32", "quicksilver33", "rogueshadow34", "solarflare35", "thundercore36", "ultraviolet37", "venomstrike38", "wildtiger39", "xenoblade40", "youngwolf41", "zenith42", "alphaecho43", "binarybeast44", "cosmicdust45", "dragonbyte46", "emberstorm47", "fusionx48", "ghostdrive49", "hexacode50", "icyinferno51", "junglehawk52", "krakenbyte53", "legendwave54", "matrixmind55", "novaengine56", "orbitking57", "primeforce58", "quantaflux59", "rocketbyte60", "skyhunter61", "titanforge62", "unitystorm63", "vectorbyte64", "warpzone65", "xrayvision66", "yellowhawk67", "zerocool68", "apexstorm69", "blackwolf70", "cloudrunner71", "deepmatrix72", "electricfox73", "firestorm74", "gravitycore75", "hydrazone76", "icephoenix77", "jetstream78", "knightbyte79", "lavasurge80", "moonwalker81", "nebulashift82", "onyxshadow83", "powergrid84", "quantaking85", "ragingbull86", "shadowbyte87", "techvortex88", "ultrawave89", "virtualace90", "wolfpack91", "xfactor92", "yottabyte93", "zenmaster94", "astrobyte95", "bytebuster96", "corefusion97", "deltaforce98", "epicstorm99", "finalboss100"}

var titles = []string{
	"Getting Started with Go",
	"Understanding Goroutines",
	"Mastering SQL Joins",
	"REST API Best Practices",
	"Building a JWT Authentication System",
	"Docker for Beginners",
	"Introduction to PostgreSQL",
	"Clean Code in Go",
	"Repository Pattern Explained",
	"Understanding Interfaces in Go",
	"Concurrency Made Easy",
	"Deploying Applications with Docker",
	"Error Handling in Go",
	"Working with Context Package",
	"Building a Social Media API",
	"Introduction to Redis Caching",
	"Optimizing Database Queries",
	"Unit Testing in Go",
	"Middleware in Chi Router",
	"Learning Data Structures",
}

var contents = []string{
	"Go is a simple, efficient, and modern programming language designed for building reliable software.",
	"Goroutines allow lightweight concurrent execution, making Go ideal for scalable applications.",
	"SQL joins help combine data from multiple tables using relationships between them.",
	"A well-designed REST API should be consistent, stateless, and properly documented.",
	"JWT authentication enables secure user sessions without storing server-side session data.",
	"Docker containers make application deployment predictable across different environments.",
	"PostgreSQL is a powerful open-source relational database with advanced SQL features.",
	"Writing clean code improves readability, maintainability, and collaboration within teams.", "The repository pattern separates business logic from data access, making code easier to test.",
	"Interfaces in Go define behavior without requiring inheritance, promoting loose coupling.",
	"Concurrency allows programs to perform multiple tasks efficiently without blocking execution.",
	"Docker Compose simplifies running multi-container applications with a single configuration file.",
	"Go encourages explicit error handling instead of relying on exceptions.",
	"The context package helps manage request lifecycles, cancellations, and timeouts.",
	"A social media API typically includes authentication, posts, comments, likes, and followers.",
	"Redis is commonly used for caching frequently accessed data to improve performance.",
	"Efficient database queries reduce latency and improve the overall user experience.",
	"Unit tests verify that individual functions behave correctly under different conditions.",
	"Middleware in Chi can handle authentication, logging, rate limiting, and CORS.",
	"Understanding data structures is essential for solving algorithmic problems efficiently.",
}

var tags = []string{
	"go",
	"backend",
	"programming",
	"goroutines",
	"concurrency",
	"postgres",
	"sql",
	"database",
	"rest-api",
	"jwt",
	"authentication",
	"docker",
	"devops",
	"redis",
	"testing",
	"middleware",
	"chi",
	"performance",
	"algorithms",
	"clean-code",
}

var comments = []string{
	"Great post! Really enjoyed reading this.",
	"Thanks for sharing this information.",
	"This helped me understand the topic much better.",
	"Excellent explanation. Keep it up!",
	"I've been looking for something like this.",
	"Very informative and well written.",
	"I completely agree with your points.",
	"This is a great starting point for beginners.",
	"Could you write a follow-up on this topic?",
	"I learned something new today. Thanks!",
	"Awesome content! Looking forward to more posts.",
	"This solved the problem I was facing.",
	"Really clean and easy to understand.",
	"I appreciate the detailed explanation.",
	"Interesting perspective. I hadn't thought about it that way.",
	"Nice work! Thanks for taking the time to write this.",
	"This is exactly what I needed.",
	"Very helpful article. Bookmarked it!",
	"I'll definitely try this approach in my project.",
	"Fantastic post. Keep sharing more content like this!",
}

func Seed(store store.Storage, db *sql.DB) {
	ctx := context.Background()

	users := generateUsers(100)
	tx, _ := db.BeginTx(ctx, nil)
	for _, user := range users {
		if err := store.Users.Create(ctx, tx, user); err != nil {
			_ = tx.Rollback()
			log.Println("error creating user:", err)
			return
		}
	}
	tx.Commit()
	posts := generatePosts(200, users)
	for _, post := range posts {
		if err := store.Posts.Create(ctx, post); err != nil {
			log.Println("error creating post:", err)
			return
		}
	}

	comments := generateComments(5000, users, posts)
	for _, comment := range comments {
		if err := store.Comments.Create(ctx, comment); err != nil {
			log.Println("error creating comments:", err)
			return
		}
	}

	log.Println("Seeding Completed!!")

}

func generateUsers(num int) []*store.User {
	users := make([]*store.User, num)
	for i := range num {
		u := &store.User{
			Username: usernames[i],
			Email:    usernames[i] + "@example.com",
		}
		if err := u.Password.Set("example123"); err != nil {
			panic(err)
		}
		users[i] = u
	}
	return users
}

func generatePosts(num int, users []*store.User) []*store.Post {
	posts := make([]*store.Post, num)
	for i := range num {
		user := users[rand.Intn(len(users))]

		tag1 := tags[rand.Intn(len(tags))]
		tag2 := tag1
		for tag1 == tag2 {
			tag2 = tags[rand.Intn(len(tags))]
		}

		posts[i] = &store.Post{
			UserID:  user.ID,
			Title:   titles[rand.Intn(len(titles))],
			Content: contents[rand.Intn(len(contents))],
			Tags: []string{
				tag1,
				tag2,
			},
		}

	}
	return posts
}

func generateComments(num int, users []*store.User, posts []*store.Post) []*store.Comment {
	cms := make([]*store.Comment, num)
	for i := range num {
		cms[i] = &store.Comment{
			PostID:  posts[rand.Intn(len(posts))].ID,
			UserID:  users[rand.Intn(len(users))].ID,
			Content: comments[rand.Intn(len(comments))],
		}
	}
	return cms
}
