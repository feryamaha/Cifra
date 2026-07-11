/**
 * Schema Drizzle — Auth user + admin moderação + CRM (SPEC_001/002).
 * Nunca expor passwordHash em APIs.
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { Song } from '@/types/song/song.types';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const versionStatusEnum = pgEnum('version_status', [
  'draft',
  'pending_review',
  'published',
  'rejected',
]);
export const moderationActionEnum = pgEnum('moderation_action', ['approve', 'reject']);
export const rejectionCategoryEnum = pgEnum('rejection_category', [
  'duplication',
  'typos',
  'technical_error',
  'copyright',
  'edit_required',
]);

export const userPlanEnum = pgEnum('user_plan', ['free', 'premium']);

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('user'),
  plan: userPlanEnum('plan').notNull().default('free'),
  blocked: boolean('blocked').notNull().default(false),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  lastLoginAt: timestamp('last_login_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const works = pgTable('works', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artist: text('artist').notNull(),
  title: text('title').notNull(),
  normalizedArtist: text('normalized_artist').notNull(),
  normalizedTitle: text('normalized_title').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const songVersions = pgTable('song_versions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workId: text('work_id')
    .notNull()
    .references(() => works.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  status: versionStatusEnum('status').notNull().default('pending_review'),
  label: text('label'),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  payload: jsonb('payload').$type<Song>().notNull(),
  rejectionReason: text('rejection_reason'),
  rejectionCategory: rejectionCategoryEnum('rejection_category'),
  revisionCount: integer('revision_count').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { mode: 'date' }),
});

export const moderationEvents = pgTable('moderation_events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  versionId: text('version_id')
    .notNull()
    .references(() => songVersions.id, { onDelete: 'cascade' }),
  adminId: text('admin_id').references(() => users.id, { onDelete: 'set null' }),
  action: moderationActionEnum('action').notNull(),
  reason: text('reason'),
  category: rejectionCategoryEnum('category'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const userNotifications = pgTable('user_notifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  versionId: text('version_id').references(() => songVersions.id, { onDelete: 'set null' }),
  meta: jsonb('meta').$type<Record<string, string>>(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

/** Mensagens user → admin (e respostas de argumentação de rejeição). */
export const adminInboxMessages = pgTable('admin_inbox_messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  relatedVersionId: text('related_version_id').references(() => songVersions.id, {
    onDelete: 'set null',
  }),
  kind: text('kind').notNull().default('general'), // general | rejection_appeal
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

/**
 * Rate limit multi-instância (auth, submit, admin).
 * Chave = scope:ip ou scope:email; janela via resetAt.
 */
export const rateBuckets = pgTable('rate_buckets', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  resetAt: timestamp('reset_at', { mode: 'date' }).notNull(),
});

/** SPEC_006 B1 — coleções pessoais */
export const userCollections = pgTable('user_collections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

/** SPEC_006 B1 — favoritos (songSlug = identificador público) */
export const userFavorites = pgTable('user_favorites', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  songSlug: text('song_slug').notNull(),
  collectionId: text('collection_id').references(() => userCollections.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

/** SPEC_006 A7 / B2 — views e histórico autenticado */
export const songViews = pgTable('song_views', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  songSlug: text('song_slug').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const commentStatusEnum = pgEnum('comment_status', ['pending', 'published', 'rejected']);

/** SPEC_006 B3 */
export const songComments = pgTable('song_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  songSlug: text('song_slug').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  status: commentStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

/** SPEC_006 B4 */
export const versionVotes = pgTable('version_votes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  versionId: text('version_id')
    .notNull()
    .references(() => songVersions.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  direction: integer('direction').notNull(), // 1 | -1
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  versions: many(songVersions),
  notifications: many(userNotifications),
  inboxMessages: many(adminInboxMessages),
  favorites: many(userFavorites),
  collections: many(userCollections),
}));

export const worksRelations = relations(works, ({ many }) => ({
  versions: many(songVersions),
}));

export const songVersionsRelations = relations(songVersions, ({ one, many }) => ({
  work: one(works, { fields: [songVersions.workId], references: [works.id] }),
  author: one(users, { fields: [songVersions.authorId], references: [users.id] }),
  events: many(moderationEvents),
}));
