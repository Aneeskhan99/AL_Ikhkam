-- Al-Ihkam admin: initial schema.
-- Runs once through `npm run setup` (db/setup.ts). Never edit an applied migration;
-- add a new numbered file instead.

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'author')),
  password_hash TEXT NOT NULL,
  disabled      BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_token  TEXT NOT NULL,
  ip          TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS login_attempts (
  id         BIGSERIAL PRIMARY KEY,
  username   TEXT,
  ip         TEXT,
  success    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_lookup_idx ON login_attempts(ip, created_at);

-- Page text, lists and images. A row exists only when a value differs from the code default.
-- draft holds unpublished edits; draft_reset = true means "return to default on publish".
CREATE TABLE IF NOT EXISTS content_fields (
  key          TEXT NOT NULL,
  locale       TEXT NOT NULL,           -- 'en', 'ur', or '*' for shared fields such as images
  published    JSONB,
  draft        JSONB,
  draft_reset  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  PRIMARY KEY (key, locale)
);

CREATE TABLE IF NOT EXISTS content_history (
  id         BIGSERIAL PRIMARY KEY,
  key        TEXT NOT NULL,
  locale     TEXT NOT NULL,
  action     TEXT NOT NULL,             -- 'publish' | 'reset'
  old_value  JSONB,
  new_value  JSONB,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_history_key_idx ON content_history(key, created_at DESC);

CREATE TABLE IF NOT EXISTS posts (
  id           BIGSERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published')),
  publish_at   TIMESTAMPTZ,
  author_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  image        TEXT,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  data         JSONB NOT NULL,          -- { title, excerpt, topic, body, imageAlt } each as { en, ur }
  seo          JSONB NOT NULL DEFAULT '{}',
  autosave     JSONB,
  autosaved_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_visible_idx ON posts(status, publish_at);

CREATE TABLE IF NOT EXISTS programmes (
  id         BIGSERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  kind       TEXT NOT NULL CHECK (kind IN ('course', 'workshop')),
  sort       INTEGER NOT NULL DEFAULT 0,
  visible    BOOLEAN NOT NULL DEFAULT TRUE,
  data       JSONB NOT NULL,            -- level, title, duration, format, summary, audience, modules
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculty (
  id         BIGSERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  sort       INTEGER NOT NULL DEFAULT 0,
  visible    BOOLEAN NOT NULL DEFAULT TRUE,
  photo      TEXT,
  data       JSONB NOT NULL,            -- initial, name, role, affiliation, bio, education, focus, email, links
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id          BIGSERIAL PRIMARY KEY,
  form        TEXT NOT NULL DEFAULT 'consultation',
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  organisation TEXT,
  interest    TEXT,
  programme   TEXT,
  message     TEXT,
  locale      TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'engaged', 'closed')),
  assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
  source_page TEXT,
  landing_page TEXT,
  referrer    TEXT,
  utm         JSONB NOT NULL DEFAULT '{}',
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries(status);

CREATE TABLE IF NOT EXISTS enquiry_notes (
  id         BIGSERIAL PRIMARY KEY,
  enquiry_id BIGINT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  note       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id          BIGSERIAL PRIMARY KEY,
  file        TEXT NOT NULL UNIQUE,     -- file name inside MEDIA_DIR
  original_name TEXT,
  mime        TEXT NOT NULL,
  width       INTEGER,
  height      INTEGER,
  bytes       INTEGER NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SEO overrides for fixed pages ('home', 'advisory', 'programme:<slug>', ...). Posts keep theirs in posts.seo.
CREATE TABLE IF NOT EXISTS seo (
  key         TEXT NOT NULL,
  locale      TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  og_image    TEXT,
  noindex     BOOLEAN NOT NULL DEFAULT FALSE,
  canonical   TEXT,
  updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key, locale)
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT,
  summary    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log(created_at DESC);
