# train_heart_model.py

# === Imports ===
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

os.makedirs("models", exist_ok=True)

# === Load dataset ===
# Update path if necessary
df = pd.read_csv(r"c:\Users\rohan\Desktop\BCA\PBL\Disease_Prediction\datasets\heart.csv")

# === Separate features and target ===
X = df.drop(columns=["target"])
y = df["target"]

# === Train-test split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Scale the data ===
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# === Train the model ===
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# === Evaluate accuracy ===
accuracy = model.score(X_test_scaled, y_test)
print(f"✅ Heart Disease Model trained successfully! Accuracy: {accuracy:.2f}")

# === Save model and scaler ===
with open("models/heart_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

with open("models/heart_scaler.pkl", "wb") as scaler_file:
    pickle.dump(scaler, scaler_file)

print("💾 Model and Scaler saved in 'models' folder.")
