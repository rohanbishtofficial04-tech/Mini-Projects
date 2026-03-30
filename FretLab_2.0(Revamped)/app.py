from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/chords')
def chords():
    return render_template('chords.html')

@app.route('/metronome')
def metronome():
    return render_template('metronome.html')

@app.route('/tuner')
def tuner():
    return render_template('tuner.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
