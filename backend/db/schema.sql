-- ============================================================
-- Community Carbon Footprint & Green Rewards Tracker
-- PostgreSQL Schema
-- ============================================================

DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS emission_factors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users -----------------------------------------------------
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(160) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(20) NOT NULL DEFAULT 'user'
                 CHECK (role IN ('user', 'employee', 'admin')),
  phone          VARCHAR(20),
  avatar_url     TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Emission Factors -------------------------------------------
-- Configurable rules used to compute a carbon score from raw activity data.
CREATE TABLE emission_factors (
  id             SERIAL PRIMARY KEY,
  category       VARCHAR(40) NOT NULL
                 CHECK (category IN ('commute', 'electricity', 'water', 'waste')),
  key            VARCHAR(60) NOT NULL,      -- e.g. 'car', 'bus', 'cycle', 'kwh', 'liter', 'segregated_bonus'
  label          VARCHAR(120) NOT NULL,     -- human readable label
  factor_value   NUMERIC(10,4) NOT NULL,    -- kg CO2e per unit (or bonus/negative for reductions)
  unit           VARCHAR(30) NOT NULL,      -- 'km', 'kwh', 'liter', 'flat'
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category, key)
);

-- 5. Campaigns ---------------------------------------------------
CREATE TABLE campaigns (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(150) NOT NULL,
  description       TEXT,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  points_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Activities ----------------------------------------------------
CREATE TABLE activities (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  commute_mode        VARCHAR(30),          -- 'car','bike','bus','train','cycle','walk','wfh'
  commute_distance_km NUMERIC(6,2) DEFAULT 0,
  electricity_kwh     NUMERIC(8,2) DEFAULT 0,
  water_liters        NUMERIC(8,2) DEFAULT 0,
  waste_segregated    BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  carbon_score        NUMERIC(10,2) NOT NULL DEFAULT 0,  -- computed, kg CO2e for the day
  status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, activity_date)
);

-- 3. Verifications ---------------------------------------------------
CREATE TABLE verifications (
  id            SERIAL PRIMARY KEY,
  activity_id   INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  verifier_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  decision      VARCHAR(20) NOT NULL CHECK (decision IN ('verified', 'rejected')),
  remarks       TEXT,
  verified_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Rewards ------------------------------------------------------
CREATE TABLE rewards (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id   INTEGER REFERENCES activities(id) ON DELETE SET NULL,
  campaign_id   INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  points        NUMERIC(8,2) NOT NULL DEFAULT 0,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at    TIMESTAMPTZ
);

-- Helpful indexes -------------------------------------------------
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_verifications_activity ON verifications(activity_id);
