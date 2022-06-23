from swagger_server.models.trip_day_data import TripDayData
from swagger_server.models.weather_day_data import WeatherDayData
from swagger_server.models.measure import Measure
from swagger_server.daos import trip_day_data_dao, weather_day_data_dao

def get_real(date, station_id):
    realTripDayDataRentals = trip_day_data_dao.get_real_rentals(date, station_id)
    realTripDayDataReturns = trip_day_data_dao.get_real_returns(date, station_id)

    rentals, returns = list(), list()
    for row in realTripDayDataRentals:
        rentals.append(Measure(row.get_time().hour, row.get_value()))
    for row in realTripDayDataReturns:
        returns.append(Measure(row.get_time().hour, row.get_value()))

    realTripDayData = TripDayData(date, station_id, rentals, returns)
    return realTripDayData

def get_weather(date):
    weatherDayDataTemperatures = weather_day_data_dao.get_weather_temperatures(date)
    weatherDayDataHumidities = weather_day_data_dao.get_weather_humidities(date)

    temperatures, humidities = list(), list()
    for row in weatherDayDataTemperatures:
        temperatures.append(Measure(row.get_time().hour, row.get_value()))
    for row in weatherDayDataHumidities:
        humidities.append(Measure(row.get_time().hour, row.get_value()))

    weatherDayData = WeatherDayData(date, temperatures, humidities)
    return weatherDayData
