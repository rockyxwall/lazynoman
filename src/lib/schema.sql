CREATE TABLE IF NOT EXISTS novels (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  cover_url   TEXT,
  synopsis    TEXT,
  author      TEXT,
  origin      TEXT,        -- CN, KR, JP, EN
  source_url  TEXT,        -- NovelUpdates link
  read_chapters  INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  pages_left     INTEGER,
  start_date  TEXT,
  end_date    TEXT,
  rating      REAL,
  status      TEXT DEFAULT 'Plan to Read',
    -- values: Reading | Finished | Dropped | Paused | Plan to Read
  review_slug TEXT,
    -- matches MDX filename without extension e.g. "the-innkeeper-review"
  media_type  TEXT DEFAULT 'novel',
    -- novel | manga | manhwa | manhua | game | anime
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS genres (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS novel_genres (
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (novel_id, genre_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
  -- e.g. "Weak to Strong", "System", "Harem", "Cheat", "Reincarnation"
);

CREATE TABLE IF NOT EXISTS novel_tags (
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (novel_id, tag_id)
);

-- Embeddings for recommendation engine
CREATE TABLE IF NOT EXISTS novel_embeddings (
  novel_id  INTEGER PRIMARY KEY REFERENCES novels(id) ON DELETE CASCADE,
  embedding F32_BLOB(768),  -- Cloudflare AI bge-base-en-v1.5
  model     TEXT DEFAULT 'bge-base-en-v1.5',
  built_at  TEXT DEFAULT (datetime('now'))
);

-- Vector index for ANN search
CREATE INDEX IF NOT EXISTS novel_embeddings_vec_idx
  ON novel_embeddings (libsql_vector_idx(embedding));

-- Stats Cache
CREATE TABLE IF NOT EXISTS stats_cache (
  id             INTEGER PRIMARY KEY,
  total_read     INTEGER DEFAULT 0,
  total_finished INTEGER DEFAULT 0,
  total_dropped  INTEGER DEFAULT 0,
  total_paused   INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  avg_rating     REAL,
  updated_at     TEXT DEFAULT (datetime('now'))
);
