CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`article_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `submitted_articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_fav_unique` ON `favorites` (`user_id`,`article_id`);--> statement-breakpoint
CREATE INDEX `idx_fav_user` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`token_jti` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_jti` ON `sessions` (`token_jti`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `submitted_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`slug` text,
	`content_md` text NOT NULL,
	`category` text NOT NULL,
	`tags` text DEFAULT '[]',
	`cover_image` text,
	`locale` text DEFAULT 'zh',
	`status` text DEFAULT 'draft',
	`review_comment` text,
	`reviewed_by` integer,
	`reviewed_at` text,
	`source_url` text,
	`published_at` text,
	`view_count` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sa_user` ON `submitted_articles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sa_status` ON `submitted_articles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_sa_category` ON `submitted_articles` (`category`);--> statement-breakpoint
CREATE INDEX `idx_sa_locale` ON `submitted_articles` (`locale`);--> statement-breakpoint
CREATE INDEX `idx_sa_published` ON `submitted_articles` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`avatar_url` text,
	`role` text DEFAULT 'user',
	`status` text DEFAULT 'active',
	`password_reset` integer DEFAULT 0,
	`bio` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);--> statement-breakpoint
CREATE TABLE `verification_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`purpose` text DEFAULT 'register',
	`expires_at` text NOT NULL,
	`used` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `idx_vcodes_email` ON `verification_codes` (`email`);--> statement-breakpoint
CREATE INDEX `idx_vcodes_expires` ON `verification_codes` (`expires_at`);