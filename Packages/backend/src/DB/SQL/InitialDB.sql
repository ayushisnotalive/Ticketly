--user
CREATE TABLE IF NOT EXISTS USERS(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    CHECK (role IN('user','admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


--refresh token
CREATE TABLE IF NOT EXISTS refresh_tokens(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

--events

CREATE TABLE IF NOT EXISTS events (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    city       VARCHAR(100) NOT NULL,
    starts_at  TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

--seats
CREATE TABLE IF NOT EXISTS seats (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id    BIGINT      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    label       VARCHAR(10) NOT NULL,              -- e.g. 'A1'
    price_cents INT         NOT NULL CHECK (price_cents >= 0),
    status      VARCHAR(20) NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'booked')),
    UNIQUE (event_id, label)                       -- no two 'A1' in one event
);

--booking
CREATE TABLE IF NOT EXISTS bookings (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id),
    event_id    BIGINT      NOT NULL REFERENCES events(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'cancelled')),
    total_cents INT         NOT NULL CHECK (total_cents >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BOOKING_SEATS (the safety net against double booking)
CREATE TABLE IF NOT EXISTS booking_seats (
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id    BIGINT NOT NULL UNIQUE REFERENCES seats(id),
    PRIMARY KEY (booking_id, seat_id)
);

-- IDEMPOTENCY KEYS
CREATE TABLE IF NOT EXISTS idempotency_keys (
    user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key          VARCHAR(100) NOT NULL,
    request_hash TEXT        NOT NULL,
    response     JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)
);

-- INDEXES (for speed)
CREATE INDEX IF NOT EXISTS idx_seats_event_status ON seats (event_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user      ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at   ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_city        ON events (city);