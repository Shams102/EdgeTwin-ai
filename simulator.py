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
    profile: str = "healthy"
    baseline_temp: float = 70.0
    baseline_vib: float = 0.02
    baseline_pressure: float = 30.0
    baseline_rpm: float = 1500.0
    age: int = 0
    critical_cycles: int = 0

    def step(self):
        """Advance simulation one timestep using the machine's health profile."""
        self.age += 1

        # Check if we need to auto-reset due to simulated maintenance
        if self.vibration > 0.065 or self.temperature > 95.0:
            self.critical_cycles += 1
            if self.critical_cycles > 12:  # ~30 seconds critical
                self.reset_to_healthy()
                return
        else:
            self.critical_cycles = 0

        # Randomly start degradation on stable/healthy machines to keep demo dynamic
        if (self.profile == "stable" or self.profile == "healthy") and random.random() < 0.01:
            self.profile = "degrading"

        if self.profile == "degrading":
            self._step_degrading()
            # Transition to critical status if values exceed limit
            if self.vibration > 0.055 or self.temperature > 92.0:
                self.profile = "critical"
        elif self.profile == "critical":
            self._step_critical()
        else:
            self._step_stable()

        self._clamp_values()

    def reset_to_healthy(self):
        print(f"  [MAINT] Maintenance performed on Machine {self.machine_id}. Resetting components to nominal.")
        self.profile = "stable"
        self.temperature = self.baseline_temp + random.uniform(-1, 1)
        self.vibration = self.baseline_vib + random.uniform(-0.002, 0.002)
        self.pressure = self.baseline_pressure + random.uniform(-0.5, 0.5)
        self.rpm = self.baseline_rpm + random.uniform(-20, 20)
        self.critical_cycles = 0

    def _step_stable(self):
        """Healthy/stable machines oscillate around their baseline."""
        self.temperature += random.uniform(-0.4, 0.4) + (self.baseline_temp - self.temperature) * 0.08
        self.vibration   += random.uniform(-0.0012, 0.0012) + (self.baseline_vib - self.vibration) * 0.08
        self.pressure    += random.uniform(-0.2, 0.2) + (self.baseline_pressure - self.pressure) * 0.05
        self.rpm         += random.uniform(-25, 25) + (self.baseline_rpm - self.rpm) * 0.05

    def _step_degrading(self):
        """Degrading machines slowly drift upward from their baseline."""
        self.temperature += random.uniform(0.05, 0.25)
        self.vibration   += random.uniform(0.0002, 0.0008)
        self.pressure    += random.uniform(0.0, 0.15)
        self.rpm         += random.uniform(-40, 20)

    def _step_critical(self):
        """Critical machines stay in a high-risk band with small variation."""
        self.temperature += random.uniform(-0.6, 0.6) + (self.baseline_temp + 15.0 - self.temperature) * 0.04
        self.vibration   += random.uniform(-0.002, 0.002) + (self.baseline_vib + 0.04 - self.vibration) * 0.04
        self.pressure    += random.uniform(-0.3, 0.3) + (self.baseline_pressure + 8.0 - self.pressure) * 0.03
        self.rpm         += random.uniform(-60, 60) + (self.baseline_rpm - 300 - self.rpm) * 0.03

    def _clamp_values(self):
        self.temperature = max(55.0,  min(120.0, self.temperature))
        self.vibration   = max(0.005, min(0.09,  self.vibration))
        self.pressure    = max(18.0,  min(48.0,  self.pressure))
        self.rpm         = max(600.0, min(2200.0, self.rpm))

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
        # id, temp,  vib,   psi,   rpm,   profile
        (1,   65.0,  0.018, 28.5,  1480,  "healthy"),
        (2,   80.0,  0.038, 32.5,  1185,  "degrading"),
        (3,   58.0,  0.012, 25.0,  905,   "stable"),
        (4,   94.0,  0.068, 39.0,  1830,  "critical"),
        (5,   70.5,  0.022, 30.0,  1345,  "healthy"),
        (6,   72.5,  0.025, 31.5,  1595,  "stable"),
    ]
    machines = []
    for i in range(min(count, len(profiles))):
        mid, temp, vib, psi, rpm, profile = profiles[i]
        machines.append(MachineState(
            machine_id=mid,
            temperature=temp + random.uniform(-1, 1),
            vibration=vib + random.uniform(-0.002, 0.002),
            pressure=psi + random.uniform(-0.5, 0.5),
            rpm=rpm + random.uniform(-20, 20),
            profile=profile,
            baseline_temp=temp,
            baseline_vib=vib,
            baseline_pressure=psi,
            baseline_rpm=rpm,
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
