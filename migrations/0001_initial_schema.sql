CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  weight_kg INTEGER NOT NULL CHECK (weight_kg BETWEEN 30 AND 250),
  height_cm INTEGER NOT NULL DEFAULT 170 CHECK (height_cm BETWEEN 100 AND 250),
  daily_goal_ml INTEGER NOT NULL DEFAULT 2000 CHECK (daily_goal_ml BETWEEN 300 AND 6000),
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE containers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 32),
  volume_ml INTEGER NOT NULL CHECK (volume_ml BETWEEN 1 AND 5000),
  kind TEXT NOT NULL CHECK (kind IN ('glass', 'bottle', 'cup')),
  created_at TEXT NOT NULL
);

CREATE INDEX idx_containers_user_id ON containers(user_id);

CREATE TABLE water_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  container_id TEXT REFERENCES containers(id) ON DELETE SET NULL,
  container_name_snapshot TEXT NOT NULL,
  amount_ml INTEGER NOT NULL CHECK (amount_ml BETWEEN 1 AND 5000),
  consumed_at TEXT NOT NULL
);

CREATE INDEX idx_water_logs_user_consumed_at ON water_logs(user_id, consumed_at);
CREATE INDEX idx_water_logs_consumed_at ON water_logs(consumed_at);
