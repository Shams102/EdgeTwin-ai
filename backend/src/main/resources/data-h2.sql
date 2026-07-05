-- EdgeTwin AI — H2 Seed Data

-- Machines
INSERT INTO machines (name, location, status) VALUES
    ('CNC Mill A3',        'Factory Floor B',   'RUNNING'),
    ('Hydraulic Press B1', 'Assembly Line C',   'WARNING'),
    ('Conveyor Belt C2',   'Warehouse D',       'RUNNING'),
    ('Robotic Arm D4',     'Assembly Line A',   'CRITICAL'),
    ('Compressor E1',      'Utility Room',      'RUNNING'),
    ('Turbine F2',         'Power Station',     'RUNNING');

-- Machine 1: CNC Mill A3 — healthy
INSERT INTO predictions (machine_id, temperature, vibration, pressure, rpm, failure_probability, health_score, risk_level, recommendation, predicted_at) VALUES
    (1, 65.2, 0.018, 28.5, 1480, 0.05, 95.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -6, NOW())),
    (1, 66.1, 0.019, 28.7, 1475, 0.06, 94.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -4, NOW())),
    (1, 64.8, 0.017, 28.3, 1490, 0.04, 96.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -2, NOW())),
    (1, 65.5, 0.018, 28.6, 1485, 0.05, 95.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', NOW());

-- Machine 2: Hydraulic Press B1 — degrading
INSERT INTO predictions (machine_id, temperature, vibration, pressure, rpm, failure_probability, health_score, risk_level, recommendation, predicted_at) VALUES
    (2, 78.3, 0.035, 32.1, 1200, 0.28, 72.0, 'LOW',    'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -6, NOW())),
    (2, 80.1, 0.038, 32.8, 1190, 0.35, 65.0, 'MEDIUM', 'Monitor closely. Schedule preventive maintenance within 1 week.', DATEADD('HOUR', -4, NOW())),
    (2, 82.5, 0.041, 33.2, 1180, 0.42, 58.0, 'MEDIUM', 'Monitor closely. Schedule preventive maintenance within 1 week.', DATEADD('HOUR', -2, NOW())),
    (2, 84.0, 0.044, 33.8, 1170, 0.48, 52.0, 'MEDIUM', 'Monitor closely. Schedule preventive maintenance within 1 week.', NOW());

-- Machine 3: Conveyor Belt C2 — stable
INSERT INTO predictions (machine_id, temperature, vibration, pressure, rpm, failure_probability, health_score, risk_level, recommendation, predicted_at) VALUES
    (3, 58.0, 0.012, 25.0, 900, 0.08, 92.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -4, NOW())),
    (3, 57.5, 0.011, 24.8, 910, 0.07, 93.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', NOW());

-- Machine 4: Robotic Arm D4 — critical
INSERT INTO predictions (machine_id, temperature, vibration, pressure, rpm, failure_probability, health_score, risk_level, recommendation, predicted_at) VALUES
    (4, 92.0, 0.062, 38.5, 1800, 0.65, 35.0, 'HIGH',     'Vibration levels elevated. Inspect bearings and alignment.', DATEADD('HOUR', -6, NOW())),
    (4, 94.5, 0.068, 39.2, 1820, 0.72, 28.0, 'CRITICAL', 'URGENT: Schedule immediate maintenance. High failure risk detected.', DATEADD('HOUR', -4, NOW())),
    (4, 96.1, 0.071, 39.8, 1850, 0.79, 21.0, 'CRITICAL', 'URGENT: Schedule immediate maintenance. High failure risk detected.', DATEADD('HOUR', -2, NOW())),
    (4, 97.3, 0.074, 40.1, 1860, 0.82, 18.0, 'CRITICAL', 'URGENT: Schedule immediate maintenance. High failure risk detected.', NOW());

-- Machine 5: Compressor E1 — good
INSERT INTO predictions (machine_id, temperature, vibration, pressure, rpm, failure_probability, health_score, risk_level, recommendation, predicted_at) VALUES
    (5, 70.2, 0.022, 30.0, 1350, 0.11, 89.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -3, NOW())),
    (5, 70.8, 0.023, 30.2, 1340, 0.12, 88.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', NOW());

-- Machine 6: Turbine F2 — stable
INSERT INTO predictions (machine_id, temperature, vibration, pressure, rpm, failure_probability, health_score, risk_level, recommendation, predicted_at) VALUES
    (6, 72.0, 0.025, 31.5, 1600, 0.15, 85.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', DATEADD('HOUR', -5, NOW())),
    (6, 73.1, 0.026, 31.8, 1590, 0.16, 84.0, 'LOW', 'All systems nominal. Continue regular maintenance schedule.', NOW());

-- Alerts
INSERT INTO alerts (machine_id, severity, message, triggered_at) VALUES
    (4, 'CRITICAL', 'Failure probability exceeded 70% threshold. Immediate maintenance required.', DATEADD('HOUR', -4, NOW())),
    (4, 'CRITICAL', 'Failure probability at 79%. Machine degradation accelerating.', DATEADD('HOUR', -2, NOW())),
    (4, 'CRITICAL', 'Failure probability at 82%. Shutdown recommended.', NOW()),
    (2, 'WARNING',  'Failure probability rising. Preventive maintenance recommended within 1 week.', DATEADD('HOUR', -2, NOW())),
    (2, 'WARNING',  'Temperature trending upward. Monitor cooling system.', NOW());
