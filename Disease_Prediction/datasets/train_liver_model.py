#ILPD.csv contains missing (NaN) values, mainly in:
#Albumin_and_Globulin_Ratio
#LogisticRegression cannot handle NaN values, so training fails.
import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import os

os.makedirs("models", exist_ok=True)

data = pd.read_csv(
    r'C:\Users\rohan\Desktop\BCA\PBL\Disease_Prediction\datasets\ILPD.csv'
)

data.columns = data.columns.str.strip()

if data['gender'].dtype == object:
    data['gender'] = data['gender'].map({'Male': 1, 'Female': 0})

X = data.drop('is_patient', axis=1)
y = data['is_patient']


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)


y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
print(f"Liver Disease Model Accuracy: {accuracy:.2f}")


pickle.dump(model, open("models/liver_model.pkl", "wb"))
pickle.dump(scaler, open("models/liver_scaler.pkl", "wb"))

print("Liver disease Logistic Regression model and scaler saved successfully!")
