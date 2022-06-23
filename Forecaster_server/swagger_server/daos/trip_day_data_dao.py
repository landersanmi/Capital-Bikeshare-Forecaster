from datetime import datetime,  timedelta
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
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
REAL_DATA_BUCKET = config.get('DatabaseSection', 'database.bucket.realData')
FORECAST_DATA_BUCKET = config.get('DatabaseSection', 'database.bucket.forecastData')
TOKEN = keys["INFLUX_TOKEN"]

def get_real_rentals(_date, station_id):
    client = get_client()
    # Data parse
    date = parse_date(_date)
    station_id = parse_station_id(station_id)
    query = 'from(bucket: "'+REAL_DATA_BUCKET+'") |> range(start: '+date[0]+'T'+date[1]+'Z, stop: '+date[0]+'T23:59:00Z) |> filter(fn: (r) => r._measurement == "rentals" and r.stationId == "'+ str(station_id) +'")'
    tables = client.query_api().query(query, org=ORG)
    client.close()
    for table in tables:
        return table.records

def get_real_returns(_date, station_id):
    client = get_client()
    # Data parse
    date = parse_date(_date)
    station_id = parse_station_id(station_id)

    query = 'from(bucket: "'+REAL_DATA_BUCKET+'") |> range(start: '+date[0]+'T'+date[1]+'Z, stop: '+date[0]+'T23:59:00Z) |> filter(fn: (r) => r._measurement == "returns" and r.stationId == "'+ str(station_id) +'")'
    tables = client.query_api().query(query, org=ORG)
    client.close()
    for table in tables:
        return table.records

def get_forecasted_rentals(_date, station_id):
    client = get_client()
    # Data parse
    date = parse_date(_date)
    station_id = parse_station_id(station_id)

    query = 'from(bucket: "'+FORECAST_DATA_BUCKET+'") |> range(start: '+date[0]+'T'+date[1]+'Z, stop: '+date[0]+'T23:59:00Z) |> filter(fn: (r) => r._measurement == "rentals" and r.stationId == "'+ str(station_id) +'")'
    tables = client.query_api().query(query, org=ORG)
    client.close()
    for table in tables:
        return table.records

def get_forecasted_returns(_date, station_id):
    client = get_client()
    # Data parse
    date = parse_date(_date)
    station_id = parse_station_id(station_id)

    query = 'from(bucket: "'+FORECAST_DATA_BUCKET+'") |> range(start: ' + date[0] + 'T' + date[1] + 'Z, stop: ' + date[0] + 'T23:59:00Z) |> filter(fn: (r) => r._measurement == "returns" and r.stationId == "' + str(
        station_id) + '")'
    tables = client.query_api().query(query, org=ORG)
    client.close()
    for table in tables:
        return table.records

def add_forecast(_date, station_id, tripDayData):
    client = get_client()
    write_api = client.write_api(write_options=SYNCHRONOUS)
    station_id = parse_station_id(station_id)

    date = _date
    for forecastedRental in tripDayData.rentals:
        point = Point("rentals").tag("stationId", str(int(station_id))).time(str(date)).field("value", str(forecastedRental.value))
        date = date + timedelta(hours=1)
        write_api.write(bucket=FORECAST_DATA_BUCKET, org=ORG, record=point)

    date = _date
    for forecastedReturn in tripDayData.returns:
        point = Point("returns").tag("stationId", str(int(station_id))).time(str(date)).field("value", str(forecastedReturn.value))
        date = date + timedelta(hours=1)
        write_api.write(bucket=FORECAST_DATA_BUCKET, org=ORG, record=point)
    client.close()

def get_client():
    return InfluxDBClient(url=URL, token=TOKEN, org=ORG)

def parse_date(_date):
    date = _date.split('-')
    date = datetime(int(date[0]), int(date[1]), int(date[2]))
    return str(date).split(" ")

def parse_station_id(station_id):
    return int(station_id)
