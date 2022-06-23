from pymongo import MongoClient
import configparser

config = configparser.RawConfigParser()
config.read('swagger_server/MapVisualizer_server.ini')

IP = config.get('DatabaseSection', 'database.IP')
PORT = int(config.get('DatabaseSection', 'database.port'))
STATIONS_DB_NAME = config.get('DatabaseSection', 'database.stations')
COLLECTION = config.get('DatabaseSection', 'database.collection.stationInformation')

def get_client():
    mongoClient = MongoClient(IP, PORT)
    return mongoClient

def get_collection(mongoClient):
    db = mongoClient[STATIONS_DB_NAME]
    collection = db[COLLECTION]
    return collection

def get_station_information(station_id):
    client = get_client()
    collec = get_collection(client)
    station_information = collec.find_one({'station_id': station_id})
    client.close()
    return station_information

def get_stations():
    client = get_client()
    collec = get_collection(client)
    stations = collec.find()
    result = []
    for station in stations:
        result.append(station)
    client.close()
    return result
