import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

os.makedirs("models", exist_ok=True)

df = pd.read_csv(r"c:\Users\rohan\Desktop\BCA\PBL\Disease_Prediction\datasets\parkinson.csv")

if 'name' in df.columns:
    df = df.drop(columns=['name'])

X = df.drop(columns=['status'])
y = df['status']  

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = RandomForestClassifier(n_estimators=150, random_state=42)
model.fit(X_train, y_train)

acc = model.score(X_test, y_test)
print(f"Parkinson's Model Trained Successfully! Accuracy: {acc*100:.2f}%")

with open("models/parkinson_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("models/parkinson_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("Model and Scaler saved in 'models/' folder!")
