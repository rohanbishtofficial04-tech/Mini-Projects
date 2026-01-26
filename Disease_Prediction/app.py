from flask import Flask, render_template, request
import pickle
import numpy as np
import os

app = Flask(__name__)

models = {}
scalers = {}

# --- PATH CORRECTION START ---
# Get the absolute path to the directory where app.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Point to the 'models' folder relative to this script
BASE_MODEL_PATH = os.path.join(BASE_DIR, "models")
# --- PATH CORRECTION END ---

def load_model_scaler(name):
    model_path = os.path.join(BASE_MODEL_PATH, f"{name}_model.pkl")
    scaler_path = os.path.join(BASE_MODEL_PATH, f"{name}_scaler.pkl")

    if os.path.exists(model_path):
        try:
            with open(model_path, "rb") as f:
                models[name] = pickle.load(f)
        except Exception as e:
            models[name] = None
            print(f"Error loading {name} model: {e}")
    else:
        models[name] = None
        print(f"Warning: {name.capitalize()} model not found at {model_path}")

    if os.path.exists(scaler_path):
        try:
            with open(scaler_path, "rb") as f:
                scalers[name] = pickle.load(f)
        except Exception as e:
            scalers[name] = None
            print(f"Error loading {name} scaler: {e}")
    else:
        scalers[name] = None
        print(f"Note: {name.capitalize()} scaler not found (Model will run without scaling)")


diseases = [
    "diabetes", "heart", "parkinson", "breast",
    "kidney", "liver", "thyroid", "covid", "anemia"
]

for d in diseases:
    load_model_scaler(d)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/diabetes')
def diabetes_page():
    return render_template('diabetes.html')

@app.route('/heart')
def heart_page():
    return render_template('heart.html')

@app.route('/parkinson')
def parkinson_page():
    return render_template('parkinson.html')

@app.route('/breast')
def breast_page():
    return render_template('breast.html')

@app.route('/kidney')
def kidney_page():
    return render_template('kidney.html')

@app.route('/liver')
def liver_page():
    return render_template('liver.html')

@app.route('/thyroid')
def thyroid_page():
    return render_template('thyroid.html')

@app.route('/covid')
def covid_page():
    return render_template('covid.html')

@app.route('/anemia')
def anemia_page():
    return render_template('anemia.html')


def make_prediction(disease_name, form_data):
    model = models.get(disease_name)
    scaler = scalers.get(disease_name)

    if model is None:
        return "Model not available."

    try:
        values = [float(x) for x in form_data.values()]
        features = np.array([values])

        if scaler:
            features = scaler.transform(features)

        prediction = model.predict(features)
        return int(prediction[0])

    except Exception as e:
        return f"Error: {e}"


@app.route('/predict_diabetes', methods=['POST'])
def predict_diabetes():
    pred = make_prediction("diabetes", request.form)
    result = "Diabetic 😞" if pred == 1 else "Not Diabetic 😊"
    return render_template('diabetes.html', prediction_text=result)

@app.route('/predict_heart', methods=['POST'])
def predict_heart():
    pred = make_prediction("heart", request.form)
    result = "Heart Disease Detected ❤️‍🔥" if pred == 1 else "Healthy Heart 💚"
    return render_template('heart.html', prediction_text=result)

@app.route('/predict_parkinson', methods=['POST'])
def predict_parkinson():
    pred = make_prediction("parkinson", request.form)
    result = "Parkinson’s Detected 🧠" if pred == 1 else "No Parkinson’s 😊"
    return render_template('parkinson.html', prediction_text=result)

@app.route('/predict_breast', methods=['POST'])
def predict_breast():
    pred = make_prediction("breast", request.form)
    result = "Breast Cancer Detected 🎗️" if pred == 1 else "No Cancer Detected 💖"
    return render_template('breast.html', prediction_text=result)

@app.route('/predict_kidney', methods=['POST'])
def predict_kidney():
    pred = make_prediction("kidney", request.form)
    result = "Kidney Disease Detected 🚰" if pred == 1 else "Kidneys Healthy 💧"
    return render_template('kidney.html', prediction_text=result)

@app.route('/predict_liver', methods=['POST'])
def predict_liver():
    pred = make_prediction("liver", request.form)
    result = "Liver Disease Detected 🫀" if pred == 1 else "Liver Healthy 💚"
    return render_template('liver.html', prediction_text=result)

@app.route('/predict_thyroid', methods=['POST'])
def predict_thyroid():
    pred = make_prediction("thyroid", request.form)
    result = "Thyroid Issue Detected 🧬" if pred == 1 else "Thyroid Normal 💖"
    return render_template('thyroid.html', prediction_text=result)

@app.route('/predict_covid', methods=['POST'])
def predict_covid():
    pred = make_prediction("covid", request.form)
    result = "COVID-19 Detected 🦠" if pred == 1 else "COVID Negative 😊"
    return render_template('covid.html', prediction_text=result)

@app.route('/predict_anemia', methods=['POST'])
def predict_anemia():
    pred = make_prediction("anemia", request.form)
    result = "Anemia Detected 🩸" if pred == 1 else "No Anemia ✅"
    return render_template('anemia.html', prediction_text=result)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))

    # acessible externally
    app.run(debug=False, host='0.0.0.0', port=port)