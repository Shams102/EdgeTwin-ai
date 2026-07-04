"""
Training script — generates model.pkl for the Edge AI service.

Produces a RandomForestClassifier trained on synthetic sensor data.
Features: [temperature, vibration, pressure, rpm]
Target: failure (0 = normal, 1 = failure)

Run: python train_model.py
Output: model.pkl
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os


def generate_synthetic_data(n_samples=5000, random_state=42):
    """Generate realistic synthetic sensor data."""
    rng = np.random.RandomState(random_state)

    # Normal operating ranges
    temperature = rng.uniform(55, 100, n_samples)    # °C
    vibration = rng.uniform(0.005, 0.08, n_samples)   # mm/s
    pressure = rng.uniform(20, 45, n_samples)          # PSI
    rpm = rng.uniform(800, 2000, n_samples)            # RPM

    features = np.column_stack([temperature, vibration, pressure, rpm])

    # Create labels based on realistic failure conditions
    # Higher temp + vibration + pressure → more likely to fail
    failure_score = (
        (temperature - 60) / 40 * 0.35 +       # Temperature contribution
        (vibration - 0.01) / 0.07 * 0.30 +      # Vibration contribution
        (pressure - 25) / 20 * 0.20 +            # Pressure contribution
        np.abs(rpm - 1400) / 600 * 0.15          # RPM deviation contribution
    )

    # Add noise
    failure_score += rng.normal(0, 0.08, n_samples)

    # Binary classification: failure if score > 0.5
    labels = (failure_score > 0.5).astype(int)

    print(f"Generated {n_samples} samples")
    print(f"  Failures: {labels.sum()} ({labels.mean()*100:.1f}%)")
    print(f"  Normal:   {n_samples - labels.sum()} ({(1-labels.mean())*100:.1f}%)")

    return features, labels


def train_model(features, labels):
    """Train a RandomForest classifier."""
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(features, labels)

    # Print feature importances
    feature_names = ["temperature", "vibration", "pressure", "rpm"]
    importances = model.feature_importances_
    print("\nFeature Importances:")
    for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
        print(f"  {name}: {imp:.4f}")

    # Training accuracy
    accuracy = model.score(features, labels)
    print(f"\nTraining Accuracy: {accuracy:.4f}")

    return model


def main():
    print("=" * 50)
    print("EdgeTwin AI — Model Training")
    print("=" * 50)

    features, labels = generate_synthetic_data()
    model = train_model(features, labels)

    # Save model
    output_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump(model, output_path)
    print(f"\nModel saved to: {output_path}")

    # Quick test prediction
    test_input = np.array([[85.0, 0.045, 35.0, 1500]])
    proba = model.predict_proba(test_input)
    print(f"\nTest prediction (temp=85, vib=0.045, press=35, rpm=1500):")
    print(f"  Failure probability: {proba[0][1]:.2f}")
    print(f"  Health score: {(1 - proba[0][1]) * 100:.1f}")


if __name__ == "__main__":
    main()
