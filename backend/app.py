from flask import Flask
from flask_cors import CORS
from routes.config import config_bp
from routes.subscribers import subscribers_bp  # if you have this route

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(config_bp)
app.register_blueprint(subscribers_bp)  # if you have this route

if __name__ == '__main__':
    app.run(debug=True) 