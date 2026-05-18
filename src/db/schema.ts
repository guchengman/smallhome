import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('user'),
  status: text('status').default('active'),
  passwordReset: integer('password_reset').default(0),
  bio: text('bio'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('idx_users_username').on(table.username),
  uniqueIndex('idx_users_email').on(table.email),
  index('idx_users_role').on(table.role),
]);

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenJti: text('token_jti').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_sessions_user').on(table.userId),
  index('idx_sessions_jti').on(table.tokenJti),
  index('idx_sessions_expires').on(table.expiresAt),
]);

export const verificationCodes = sqliteTable('verification_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  code: text('code').notNull(),
  purpose: text('purpose').default('register'),
  expiresAt: text('expires_at').notNull(),
  used: integer('used').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_vcodes_email').on(table.email),
  index('idx_vcodes_expires').on(table.expiresAt),
]);

export const submittedArticles = sqliteTable('submitted_articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  slug: text('slug'),
  contentMd: text('content_md').notNull(),
  category: text('category').notNull(),
  tags: text('tags').default('[]'),
  coverImage: text('cover_image'),
  locale: text('locale').default('zh'),
  status: text('status').default('draft'),
  reviewComment: text('review_comment'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: text('reviewed_at'),
  sourceUrl: text('source_url'),
  publishedAt: text('published_at'),
  viewCount: integer('view_count').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_sa_user').on(table.userId),
  index('idx_sa_status').on(table.status),
  index('idx_sa_category').on(table.category),
  index('idx_sa_locale').on(table.locale),
  index('idx_sa_published').on(table.status, table.publishedAt),
]);

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  articleId: integer('article_id').notNull().references(() => submittedArticles.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('idx_fav_unique').on(table.userId, table.articleId),
  index('idx_fav_user').on(table.userId),
]);