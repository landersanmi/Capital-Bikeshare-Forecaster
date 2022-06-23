from influxdb_client import InfluxDBClient
from datetime import datetime
import configparser
import json

config = configparser.RawConfigParser()
config.read('swagger_server/Forecaster_server.ini')
with open('../keys.json') as f:
  keys = json.load(f)

ORG = config.get('DatabaseSection', 'database.org')
IP = config.get('DatabaseSection', 'database.IP')
PORT = config.get('DatabaseSection', 'database.port')
URL = "http://" + IP + ":" + PORT
WEATHER_DATA_BUCKET = config.get('DatabaseSection', 'database.bucket.weatherData')
TOKEN = keys["INFLUX_TOKEN"]

def get_weather_temperatures(_date):
    client = get_client()
    # Data parse
    date = parse_date(_date)

    query = 'from(bucket: "'+WEATHER_DATA_BUCKET+'") |> range(start: '+date[0]+'T'+date[1]+'Z, stop: '+date[0]+'T23:59:00Z) |> filter(fn: (r) => r.measure == "temp")'
    tables = client.query_api().query(query, org=ORG)
    client.close()
    for table in tables:
        return table.records

def get_weather_humidities(_date):
    client = get_client()
    # Data parse
    date = parse_date(_date)

    query = 'from(bucket: "'+WEATHER_DATA_BUCKET+'") |> range(start: '+date[0]+'T'+date[1]+'Z, stop: '+date[0]+'T23:59:00Z) |> filter(fn: (r) => r.measure == "humidity")'
    tables = client.query_api().query(query, org=ORG)
    client.close()
    for table in tables:
        return table.records

def get_client():
    return InfluxDBClient(url=URL, token=TOKEN, org=ORG)

def parse_date(_date):
    date = _date.split('-')
    date = datetime(int(date[0]), int(date[1]), int(date[2]))
    return str(date).split(" ")
