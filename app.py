from flask import Flask, render_template, jsonify, request
from detector import analyze_sensor_data

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    impact = float(data.get("impact", 0))
    rotation = float(data.get("rotation", 0))
    movement = float(data.get("movement", 0))
    sudden_stop = bool(data.get("sudden_stop", False))

    result = analyze_sensor_data(
        impact,
        rotation,
        sudden_stop,
        movement
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)