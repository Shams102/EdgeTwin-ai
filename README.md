# EdgeTwin AI

Edge AI Predictive Maintenance & Digital Twin Platform.

## Quick Start (Local Development)

```bash
# 1. Start PostgreSQL only
docker compose up db

# 2. Start Spring Boot (mock AI mode — no FastAPI needed)
cd backend
./mvnw spring-boot:run

# 3. Start React dashboard
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Full Stack (Docker)

```bash
docker compose up --build
```

## Architecture

```
React :5173 → Spring Boot :8080 → FastAPI :8000 (optional)
                    ↓
              PostgreSQL :5432
```

## Services

| Service | Port | Tech |
|---------|------|------|
| Frontend | 5173 | React + Vite + Tailwind |
| Backend | 8080 | Java 21 + Spring Boot 3 |
| Edge AI | 8000 | FastAPI + Scikit-Learn |
| Database | 5432 | PostgreSQL 16 |

## Mock AI Mode

The app runs fully without FastAPI. Set in `application.yml`:

```yaml
edge-ai:
  enabled: false  # Uses MockEdgeAiClient
```
