# EdgeTwin AI

Edge AI Predictive Maintenance & Digital Twin Platform.

## Quick Start (Local Development)

```bash
# 1. Start PostgreSQL only
docker compose up db

# 2. Start Spring Boot (mock AI mode â€” no FastAPI needed)
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
React :5173 â†’ Spring Boot :8080 â†’ FastAPI :8000 (optional)
                    â†“
              PostgreSQL :5432
```

## Integrated Simulator

After the backend is running, you can simulate live sensor traffic through Spring Boot with:

```bash
python simulator.py --count 6 --interval 3
```

This sends sensor data to `http://127.0.0.1:8080/api/machines/{machineId}/predict` for machines 1-6.

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


---

## Phase 1-3 Background

# EdgeTwin AI Edge Service

This FastAPI app loads the trained `model/model.pkl` pipeline and exposes edge inference endpoints.

## Run the service

```powershell
python app.py
# or
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## API endpoints

- `GET /health`
- `POST /predict`

### Predict request example

```json
{
  "airTemp": 298,
  "processTemp": 310,
  "rpm": 1550,
  "torque": 40,
  "toolWear": 12,
  "type": "M"
}
```

### Predict response example

```json
{
  "failureProbability": 0.0,
  "healthScore": 100,
  "failureType": "Healthy",
  "recommendation": "Continue Monitoring"
}
```

## Edge Sensor Simulator

Run the simulator while the FastAPI service is active:

```powershell
python simulator.py --endpoint http://127.0.0.1:8000/predict --count 3 --interval 2.5
```

This script generates live sensor readings, gradually increases tool wear and temperature, and sends predictions to the edge AI service.

