import pandas as pd
import numpy as np
from pymongo import MongoClient
import json
import configparser

config = configparser.RawConfigParser()
config.read('../MapVisualizer_server.ini')

IP = config.get('DatabaseSection', 'database.IP')
PORT = int(config.get('DatabaseSection', 'database.port'))
ONLY_FREQUENT_STATIONS = config.get('DataSection', 'data.onlyFrequentedStations')

def get_client():
    mongoClient = MongoClient(IP, PORT)
    return mongoClient

def get_collection(mongoClient):
    db = mongoClient.Stations
    collection = db.Station_Information
    return collection

def insert(stationInformations):
    client = get_client()
    collec = get_collection(client)
    for stationInfo in stationInformations:
        stationInfo = dict(json.loads(stationInfo))
        collec.insert_one(stationInfo)
    client.close()
    return "OK"

stationsDf = pd.read_csv(config.get('PathsSection', 'paths.dbInitializer.stationsDf'))
frequentedStations = np.loadtxt(config.get('PathsSection', 'paths.dbInitializer.frequentedStations'))

stationsDf.drop('GBFS Name', axis=1, inplace=True)
stationsDf.rename(columns={'Station ID':'station_id', 'Name':'name', 'Capacity':'capacity', 'Lat':'lat', 'Lon':'lon'},
                  inplace=True)
stationsDf[['station_id', 'capacity', 'lon', 'lat']] = stationsDf[['station_id', 'capacity', 'lon', 'lat']].astype(str)
stationsDf['json'] = stationsDf.apply(lambda x: x.to_json(), axis=1)

stationInformations = []
for index, station in stationsDf.iterrows():
    if ONLY_FREQUENT_STATIONS:
        if int(station['station_id']) in frequentedStations:
            stationInformations.append(station['json'])
    else:
        stationInformations.append(station['json'])

insert(stationInformations)
print("[+] Station Informations added to DB Stations, Collection Station_Information")