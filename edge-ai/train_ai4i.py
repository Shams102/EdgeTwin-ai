import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
import joblib


def main():
    DATA_PATH = os.path.join("dataset", "ai4i2020.csv")
    MODEL_DIR = "model"
    os.makedirs(MODEL_DIR, exist_ok=True)

    df = pd.read_csv(DATA_PATH)

    # Target and candidate features
    target = "Machine failure"
    numeric_features = [
        "Air temperature [K]",
        "Process temperature [K]",
        "Rotational speed [rpm]",
        "Torque [Nm]",
        "Tool wear [min]",
    ]
    categorical_features = ["Type"]

    # Keep only needed columns
    features = numeric_features + categorical_features
    X = df[features].copy()
    y = df[target].copy()

    # Train/test split (stratify because data is imbalanced)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Preprocessing pipelines
    numeric_transformer = Pipeline(steps=[("scaler", StandardScaler())])
    categorical_transformer = Pipeline(steps=[("ohe", OneHotEncoder(handle_unknown="ignore"))])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1, class_weight="balanced")

    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("clf", clf)])

    print("Training RandomForestClassifier...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None

    print("\nClassification report:")
    print(classification_report(y_test, y_pred, digits=4))
    print("Accuracy:", accuracy_score(y_test, y_pred))
    if y_proba is not None:
        try:
            print("ROC AUC:", roc_auc_score(y_test, y_proba))
        except Exception:
            pass

    # Retrain on the full dataset so the saved model sees all available examples
    print("\nRetraining model on the full dataset...")
    pipeline.fit(X, y)

    # Save the pipeline
    model_path = os.path.join(MODEL_DIR, "model.pkl")
    joblib.dump(pipeline, model_path)
    print(f"Saved trained pipeline to {model_path}")


if __name__ == "__main__":
    main()
