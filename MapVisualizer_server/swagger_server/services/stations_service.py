from swagger_server.daos import stations_dao
from swagger_server.models.station_information import StationInformation
from swagger_server.models.stations import Stations



def get_station_information(station_id):
    station_inf = stations_dao.get_station_information(station_id)
    if '_id' in station_inf:
        del station_inf['_id']
    station_inf = StationInformation.from_dict(station_inf)
    return station_inf

def get_stations():
    stations = stations_dao.get_stations()
    stations_info = list()
    for station in stations:
        if '_id' in station:
            del station['_id']
        stations_info.append(StationInformation.from_dict(station))
    stations = Stations(stations_info)
    return stations
