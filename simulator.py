"""
EdgeTwin AI — Integrated Sensor Simulator
==========================================
Sends simulated machine sensor data through the Spring Boot backend,
which persists data to PostgreSQL and forwards to the FastAPI Edge AI service.

Flow: simulator → Spring Boot POST /api/machines/{id}/predict
       → Spring Boot → FastAPI POST /predict
       → Spring Boot → PostgreSQL

Usage:
  python simulator.py                     # default: 3 machines, 2.5s interval
  python simulator.py --machines 6        # simulate all 6 seed machines
  python simulator.py --interval 2        # faster updates
  python simulator.py --backend http://localhost:8080
"""

import argparse
import random
import time
from dataclasses import dataclass
from typing import List

import requests


@dataclass
class MachineState:
    machine_id: int
    temperature: float     # degrees C
    vibration: float       # mm/s
    pressure: float        # PSI
    rpm: float             # rotations per minute
    age: int = 0
    degrading: bool = False

    def step(self):
        """Advance simulation one timestep — gradually degrade sensor values."""
        self.age += 1

        # Slow, realistic drift
        self.temperature += random.uniform(0.0, 0.3)
        self.vibration   += random.uniform(0.0, 0.0008)
        self.pressure    += random.uniform(-0.1, 0.2)

        # RPM wanders; more erratic at high vibration
        if self.vibration > 0.05:
            self.rpm += random.uniform(-80, 80)
        else:
            self.rpm += random.uniform(-30, 30)

        # Clamp to realistic ranges
        self.temperature = max(55.0,  min(120.0, self.temperature))
        self.vibration   = max(0.005, min(0.09,  self.vibration))
        self.pressure    = max(18.0,  min(48.0,  self.pressure))
        self.rpm         = max(600.0, min(2200.0, self.rpm))

        # Mark as degrading when vibration gets high
        if self.vibration > 0.055:
            self.degrading = True

    def to_payload(self):
        return {
            "temperature": round(self.temperature, 2),
            "vibration":   round(self.vibration, 4),
            "pressure":    round(self.pressure, 2),
            "rpm":         round(self.rpm, 1),
        }


def build_machines(count: int) -> List[MachineState]:
    """Create initial machine states matching the 6 seed machines."""
    profiles = [
        # id, temp,  vib,   psi,   rpm
        (1,   65.0,  0.018, 28.5,  1480),  # CNC Mill A3 - healthy
        (2,   80.0,  0.038, 32.5,  1185),  # Hydraulic Press B1 - degrading
        (3,   58.0,  0.012, 25.0,  905),   # Conveyor Belt C2 - stable
        (4,   94.0,  0.068, 39.0,  1830),  # Robotic Arm D4 - critical
        (5,   70.5,  0.022, 30.0,  1345),  # Compressor E1 - good
        (6,   72.5,  0.025, 31.5,  1595),  # Turbine F2 - stable
    ]
    machines = []
    for i in range(min(count, len(profiles))):
        mid, temp, vib, psi, rpm = profiles[i]
        machines.append(MachineState(
            machine_id=mid,
            temperature=temp + random.uniform(-1, 1),
            vibration=vib + random.uniform(-0.002, 0.002),
            pressure=psi + random.uniform(-0.5, 0.5),
            rpm=rpm + random.uniform(-20, 20),
        ))
    # Extra machines beyond 6 get random profiles
    for i in range(len(profiles), count):
        machines.append(MachineState(
            machine_id=i + 1,
            temperature=random.uniform(60, 80),
            vibration=random.uniform(0.01, 0.035),
            pressure=random.uniform(25, 35),
            rpm=random.uniform(1000, 1600),
        ))
    return machines


def check_backend(base_url: str) -> bool:
    """Ping the Spring Boot backend to ensure it is up."""
    try:
        r = requests.get(f"{base_url}/api/dashboard/summary", timeout=5)
        return r.status_code == 200
    except Exception as e:
        print(f"  Cannot reach backend: {e}")
        return False


def send_prediction(base_url: str, machine: MachineState):
    """POST sensor data to Spring Boot backend."""
    url = f"{base_url}/api/machines/{machine.machine_id}/predict"
    payload = machine.to_payload()
    response = requests.post(url, json=payload, timeout=10)
    response.raise_for_status()
    return payload, response.json()


def main():
    parser = argparse.ArgumentParser(description="EdgeTwin AI integrated sensor simulator")
    parser.add_argument("--backend",  default="http://localhost:8080",
                        help="Spring Boot backend base URL")
    parser.add_argument("--machines", type=int, default=3,
                        help="Number of machines to simulate (max 6 to match seed data)")
    parser.add_argument("--interval", type=float, default=2.5,
                        help="Seconds between readings per machine")
    parser.add_argument("--cycles",   type=int, default=0,
                        help="Number of cycles (0=forever)")
    args = parser.parse_args()

    print("=" * 60)
    print("  EdgeTwin AI - Sensor Simulator")
    print("=" * 60)
    print(f"  Backend : {args.backend}")
    print(f"  Machines: {args.machines}")
    print(f"  Interval: {args.interval}s")
    print()

    print("Checking backend availability...")
    for attempt in range(1, 6):
        if check_backend(args.backend):
            print("  Backend is ready")
            break
        print(f"  Attempt {attempt}/5 - retrying in 3s...")
        time.sleep(3)
    else:
        print("  Backend not reachable. Is Spring Boot running?")
        return

    machines = build_machines(args.machines)
    print(f"\nStarted {len(machines)} machine(s). Press Ctrl+C to stop.\n")

    cycle = 0
    try:
        while args.cycles == 0 or cycle < args.cycles:
            cycle += 1
            for machine in machines:
                machine.step()
                try:
                    payload, result = send_prediction(args.backend, machine)
                    health = result.get("healthScore", "?")
                    risk   = result.get("riskLevel", "?")
                    prob   = result.get("failureProbability", 0)
                    rec    = result.get("recommendation", "")

                    icon = "CRIT" if risk == "CRITICAL" else "WARN" if risk in ("HIGH", "MEDIUM") else "OK  "
                    print(
                        f"[{icon}] Machine {machine.machine_id} | cycle={cycle:3d} | "
                        f"T={payload['temperature']:5.1f}C  "
                        f"Vib={payload['vibration']:.4f}  "
                        f"RPM={payload['rpm']:6.0f} | "
                        f"Health={health}%  Risk={risk}  P(fail)={prob:.0%}"
                    )
                    if prob >= 0.4:
                        print(f"        >> {rec}")

                except requests.HTTPError as e:
                    print(f"  [Machine {machine.machine_id}] HTTP {e.response.status_code}: {e.response.text[:100]}")
                except Exception as e:
                    print(f"  [Machine {machine.machine_id}] Error: {e}")

                time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\n\nSimulator stopped.")


if __name__ == "__main__":
    main()
