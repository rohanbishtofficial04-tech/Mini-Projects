import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

data = pd.read_csv(
    "c:/Users/rohan/Desktop/BCA/PBL/Disease_Prediction/datasets/anemia.csv"
)

X = data.drop("Result", axis=1)
y = data["Result"]


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

pickle.dump(
    model,
    open("c:/Users/rohan/Desktop/BCA/PBL/Disease_Prediction/models/anemia_model.pkl", "wb")
)

pickle.dump(
    scaler,
    open("c:/Users/rohan/Desktop/BCA/PBL/Disease_Prediction/models/anemia_scaler.pkl", "wb")
)

print("Anemia model & scaler saved successfully")
