CREATE TABLE subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  ip_hash    TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_subscribers_ip_time ON subscribers (ip_hash, created_at);
