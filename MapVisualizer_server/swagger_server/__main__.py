#!/usr/bin/env python3
import connexion
import requests
from flask_cors import CORS
from swagger_server import encoder
from flask import url_for, redirect, render_template, request
from flask_babel import Babel
from flask_babel_js import BabelJS
import configparser
import json
import mimetypes

config = configparser.RawConfigParser()
config.read('swagger_server/MapVisualizer_server.ini')
with open('../keys.json') as f:
  keys = json.load(f)

PORT = config.get('ServerSection', 'server.port')
OAUTH_IP = config.get('OAuthServerSection', 'server.IP')
OAUTH_PORT = config.get('OAuthServerSection', 'server.port')
OAUTH_URL = "http://" + OAUTH_IP + ":" + OAUTH_PORT + '/'

def main():
    app = connexion.FlaskApp(__name__, specification_dir='./swagger/', options={"swagger_ui": True, "serve_spec": True})
    app.app.json_encoder = encoder.JSONEncoder
    app.add_api('swagger.yaml', arguments={'title': 'Map Visualizer | This API server shows the information of Capital Bikeshare system and his stations.'}, pythonic_params=True)
    CORS(app.app)

    mimetypes.add_type('application/javascript', '.mjs')

    # BABEL
    babel = Babel(app.app)
    babel_js = BabelJS(app.app)

    LANGUAGES = {
        'en': 'English',
        'es': 'Español',
        'eu': 'Euskera'
    }
    LANGUAGES_ARR = ['en', 'es', 'eu']
    session = dict()
    session['language'] = 'noLang'

    @babel.localeselector
    def get_locale():
        if session['language'] in LANGUAGES_ARR:
            return session['language']
        else:
            return request.accept_languages.best_match(LANGUAGES.keys())

    # APP ROUTES
    @app.route('/login')
    def maint():
        token = request.args.get('token', default='noToken', type=str)
        language = request.args.get('lang', default='noLang', type=str)
        session['language'] = language
        return redirect(url_for('map', token=str(token)))

    @app.route('/map')
    def map():
        token = request.args.get('token', default='noToken', type=str)
        # Specify the CLIENT_ID of the app that accesses the backend:
        response = requests.get('https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=' + token)

        if (response.status_code == 200):
            # ID token is valid. Get the user's Google Account ID from the decoded token.
            return render_template('map.html', MAPS_API_KEY=keys["MAPS_API_KEY"], TOKEN=token, LANGUAGE=session['language'])
        else:
            # Invalid token
            return redirect(OAUTH_URL)

    app.run(port=PORT)

if __name__ == '__main__':
    main()
