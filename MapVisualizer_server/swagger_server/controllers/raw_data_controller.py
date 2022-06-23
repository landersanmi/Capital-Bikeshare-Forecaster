import connexion
import six

from swagger_server.models.error_message import ErrorMessage  # noqa: E501
from swagger_server.models.station_id import StationId  # noqa: E501
from swagger_server.models.station_information import StationInformation  # noqa: E501
from swagger_server.models.stations import Stations  # noqa: E501
from swagger_server.models.system_information import SystemInformation  # noqa: E501
from swagger_server import util

from swagger_server.services import system_information_service, stations_service


def get_station_information(station_id):  # noqa: E501
    """Get station information

    Retrieve all the information of a specific station # noqa: E501

    :param station_id: ID of the station
    :type station_id: dict | bytes

    :rtype: StationInformation
    """
    if connexion.request.is_json:
        station_id = StationId.from_dict(connexion.request.get_json())  # noqa: E501
    return stations_service.get_station_information(station_id)


def get_stations():  # noqa: E501
    """Get list of stations

    Retrieve all the stations information # noqa: E501

    :rtype: Stations
    """
    return stations_service.get_stations()


def get_system_information():  # noqa: E501
    """Get system information

    Retrieve all the system information from the GBFS # noqa: E501

    :rtype: SystemInformation
    """

    return system_information_service.get_system_information()
