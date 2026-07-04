-- EdgeTwin AI — Database Schema
-- 3 tables: machines, predictions, alerts

CREATE TABLE IF NOT EXISTS machines (
    id        BIGSERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    location  VARCHAR(255),
    status    VARCHAR(20)  NOT NULL DEFAULT 'RUNNING'
);

CREATE TABLE IF NOT EXISTS predictions (
    id                  BIGSERIAL PRIMARY KEY,
    machine_id          BIGINT NOT NULL REFERENCES machines(id),
    temperature         DOUBLE PRECISION,
    vibration           DOUBLE PRECISION,
    pressure            DOUBLE PRECISION,
    rpm                 DOUBLE PRECISION,
    failure_probability DOUBLE PRECISION NOT NULL,
    health_score        DOUBLE PRECISION NOT NULL,
    risk_level          VARCHAR(20)  NOT NULL,
    recommendation      VARCHAR(500),
    predicted_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pred_machine ON predictions(machine_id);
CREATE INDEX IF NOT EXISTS idx_pred_time    ON predictions(predicted_at DESC);

CREATE TABLE IF NOT EXISTS alerts (
    id           BIGSERIAL PRIMARY KEY,
    machine_id   BIGINT NOT NULL REFERENCES machines(id),
    severity     VARCHAR(20)  NOT NULL,
    message      VARCHAR(500),
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_machine  ON alerts(machine_id);
CREATE INDEX IF NOT EXISTS idx_alert_severity ON alerts(severity);
