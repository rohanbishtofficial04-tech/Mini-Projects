import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


data = pd.read_csv(r'C:\Users\rohan\Desktop\BCA\PBL\Disease_Prediction\datasets\ILPD.csv')


data.columns = data.columns.str.strip()

if data['gender'].dtype == object:
    data['gender'] = data['gender'].map({'Male': 1, 'Female': 0})

X = data.drop('is_patient', axis=1).values  
y = data['is_patient'].values              


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)


y_pred = model.predict(X_test)
print("Liver Disease Model Accuracy:", accuracy_score(y_test, y_pred))


pickle.dump(model, open("liver_model.pkl", "wb"))
pickle.dump(scaler, open("liver_scaler.pkl", "wb"))

print("Liver disease model and scaler saved successfully!")
