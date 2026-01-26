import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score


data = pd.read_csv(
    "c:/Users/rohan/Desktop/BCA/PBL/Disease_Prediction/datasets/kidney.csv"
)

X = data.drop("target", axis=1)
y = data["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Kidney Model Accuracy: {accuracy * 100:.2f}%")

pickle.dump(
    model,
    open(
        "c:/Users/rohan/Desktop/BCA/PBL/Disease_Prediction/models/kidney_model.pkl",
        "wb",
    ),
)
pickle.dump(
    scaler,
    open(
        "c:/Users/rohan/Desktop/BCA/PBL/Disease_Prediction/models/kidney_scaler.pkl",
        "wb",
    ),
)

print("Kidney model & scaler saved successfully")
