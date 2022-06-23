import connexion
import six
from datetime import datetime, timedelta

from swagger_server.models.error_message import ErrorMessage  # noqa: E501
from swagger_server.models.station_id import StationId  # noqa: E501
from swagger_server.models.model_date import ModelDate # noqa: E501
from swagger_server.models.trip_day_data import TripDayData  # noqa: E501
from swagger_server.models.weather_day_data import WeatherDayData  # noqa: E501
from swagger_server import util
from swagger_server.services import forecast_data_service, real_data_service


def get_forecast(date, station_id):  # noqa: E501
    """Get forecast data

    Retrieve predictions for a station in a given day # noqa: E501

    :param _date: A specific date
    :type _date: dict | bytes
    :param station_id: ID of the station
    :type station_id: dict | bytes

    :rtype: TripDayData
    """
    if connexion.request.is_json:
        date = ModelDate.from_dict(connexion.request.get_json())  # noqa: E501
        station_id = StationId.from_dict(connexion.request.get_json())  # noqa: E501

    return forecast_data_service.get_forecast(date, station_id)


def get_lastweek(date, station_id):  # noqa: E501
    """Get last week data

    Retrieve last week real data for a station in a given day # noqa: E501

    :param _date: A specific date
    :type _date: dict | bytes
    :param station_id: ID of the station
    :type station_id: dict | bytes

    :rtype: TripDayData
    """
    if connexion.request.is_json:
        date = ModelDate.from_dict(connexion.request.get_json())  # noqa: E501
        station_id = StationId.from_dict(connexion.request.get_json())  # noqa: E501

    date = date.split("-")
    date = datetime(int(date[0]), int(date[1]), int(date[2])) - timedelta(days=7)
    return real_data_service.get_real(str(date.date()), station_id)


def get_real(date, station_id):  # noqa: E501
    """Get real data

    Retrieve real data for a station in a given day # noqa: E501

    :param _date: A specific date
    :type _date: dict | bytes
    :param station_id: ID of the station
    :type station_id: dict | bytes

    :rtype: TripDayData
    """
    if connexion.request.is_json:
        date = ModelDate.from_dict(connexion.request.get_json())  # noqa: E501
        station_id = StationId.from_dict(connexion.request.get_json())  # noqa: E501

    return real_data_service.get_real(date, station_id)


def get_weather(date):  # noqa: E501
    """Get weather data

    Retrieve the weather data for a given date # noqa: E501

    :param _date: A specific date
    :type _date: dict | bytes

    :rtype: WeatherDayData
    """
    if connexion.request.is_json:
        date = ModelDate.from_dict(connexion.request.get_json())  # noqa: E501

    return real_data_service.get_weather(date)
