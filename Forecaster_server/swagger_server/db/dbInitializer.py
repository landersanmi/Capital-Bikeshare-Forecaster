import pandas as pd
import numpy as np
import datetime
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import configparser
import json

config = configparser.RawConfigParser()
config.read('../Forecaster_server.ini')
with open('../../../keys.json') as f:
  keys = json.load(f)

ORG = "TFG"
IP = config.get('DatabaseSection', 'database.IP')
PORT = config.get('DatabaseSection', 'database.port')
URL = "http://" + IP + ":" + PORT
REAL_DATA_BUCKET = config.get('DatabaseSection', 'database.bucket.realData')
WEATHER_DATA_BUCKET = config.get('DatabaseSection', 'database.bucket.weatherData')
TOKEN = keys["INFLUX_TOKEN"]

def initialize_rentals_returns(write_api, bucket, org, stations):
    completeRentalsDf = pd.read_csv(config.get('PathsSection', 'paths.dbInitializer.completeRentalsDf'))
    completeRentalsDf['Date'] = pd.to_datetime(completeRentalsDf['Date'])
    completeReturnsDf = pd.read_csv(config.get('PathsSection', 'paths.dbInitializer.completeReturnsDf'))
    completeReturnsDf['Date'] = pd.to_datetime(completeReturnsDf['Date'])
    print(completeRentalsDf.shape, completeReturnsDf.shape)

    for station in stations:
        for row in completeRentalsDf[['Date', str(int(station))]].values:
            point = Point("rentals").tag("stationId", str(int(station))).time(str(row[0])).field("quantity", str(row[1]))
            write_api.write(bucket=bucket, org=org, record=point)

        for row in completeReturnsDf[['Date', str(int(station))]].values:
            point = Point("returns").tag("stationId", str(int(station))).time(str(row[0])).field("quantity", str(row[1]))
            write_api.write(bucket=bucket, org=org, record=point)



def initialize_weather(write_api, bucket, org):
    completeWeatherDf = pd.read_csv(config.get('PathsSection', 'paths.dbInitializer.completeWeatherDf'))
    completeWeatherDf['Date'] = pd.to_datetime(completeWeatherDf['Date'])

    for measure in ['temp', 'humidity']:
        for row in completeWeatherDf[['Date', measure]].values:
            point = Point("weather").tag("measure", measure).time(str(row[0])).field("value", str(row[1]))
            write_api.write(bucket=bucket, org=org, record=point)




with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as client:
    write_api = client.write_api(write_options=SYNCHRONOUS)

    start = datetime.datetime.now()
    stations = np.loadtxt(config.get('PathsSection', 'paths.dbInitializer.frequentedStations'))
    initialize_rentals_returns(write_api, REAL_DATA_BUCKET, ORG, stations)
    end = datetime.datetime.now()
    print("Rentals and returns finished")
    print("Tiempo transcurrido -->", end - start)

    start = datetime.datetime.now()
    initialize_weather(write_api, WEATHER_DATA_BUCKET, ORG)
    end = datetime.datetime.now()
    print("Weather finished")
    print("Tiempo transcurrido -->", end - start)

    client.close()
