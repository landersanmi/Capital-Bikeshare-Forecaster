#!/usr/bin/env python3

import connexion
from flask_cors import CORS
from swagger_server import encoder
import configparser

def main():
    config = configparser.RawConfigParser()
    config.read('swagger_server/Forecaster_server.ini')

    app = connexion.FlaskApp(__name__, specification_dir='./swagger/', options={"swagger_ui": True, "serve_spec": True})
    app.app.json_encoder = encoder.JSONEncoder
    app.add_api('swagger.yaml', arguments={'title': 'Forecaster | This API handles the information related with bike rentals, returns and forecasted data.'}, pythonic_params=True)
    CORS(app.app)
    app.run(port=int(config.get('ServerSection', 'server.port')))

if __name__ == '__main__':
    main()
