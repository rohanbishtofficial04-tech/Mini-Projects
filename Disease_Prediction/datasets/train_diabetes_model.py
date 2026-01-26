# train_diabetes_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import pickle
import os

# Make sure models folder exists
os.makedirs("models", exist_ok=True)

# Load dataset
df = pd.read_csv(r"c:\Users\rohan\Desktop\BCA\PBL\DiseasePrediction\datasets\diabetes.csv")

# Separate features and target
X = df.drop("Outcome", axis=1)
y = df["Outcome"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Logistic Regression model
model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

# Save model and scaler
with open("models/diabetes_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("models/diabetes_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

# Accuracy
accuracy = model.score(X_test_scaled, y_test)
print(f"Diabetes model trained! Test accuracy: {accuracy:.2f}")
