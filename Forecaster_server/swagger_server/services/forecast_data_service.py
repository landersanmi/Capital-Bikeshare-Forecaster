from swagger_server.services import real_data_service
from swagger_server.daos import trip_day_data_dao
from swagger_server.models.trip_day_data import TripDayData
from swagger_server.models.measure import Measure
from datetime import datetime, timedelta
import numpy as np
from tensorflow.keras.models import model_from_json
import configparser

config = configparser.RawConfigParser()
config.read('swagger_server/Forecaster_server.ini')

def get_forecast(date, station_id):
    forecastRentals = trip_day_data_dao.get_forecasted_rentals(date, station_id)
    forecastReturns = trip_day_data_dao.get_forecasted_returns(date, station_id)

    if(forecastRentals != None and forecastReturns!=None):
        rentals, returns = list(), list()
        for row in forecastRentals:
            rentals.append(Measure(row.get_time().hour, row.get_value()))
        for row in forecastReturns:
            returns.append(Measure(row.get_time().hour, row.get_value()))
        forecastTripDayData = TripDayData(date, station_id, rentals, returns)
        return forecastTripDayData
    else:
        dateSplit = date.split("-")
        dateTime = datetime(int(dateSplit[0]), int(dateSplit[1]), int(dateSplit[2]))
        dateLagged24h, dateLagged48h, dateLagged168h = str(dateTime - timedelta(days=1)).split(" ")[0],  str(dateTime - timedelta(days=2)).split(" ")[0], str(dateTime - timedelta(days=7)).split(" ")[0]

        realTripsDataLagged24h, realTripsDataLagged48h, realTripsDataLagged168h = real_data_service.get_real(dateLagged24h, station_id), real_data_service.get_real(dateLagged48h, station_id), real_data_service.get_real(dateLagged168h, station_id)
        weatherData = real_data_service.get_weather(date)

        rentalsModelData, returnsModelData = get_model_data(realTripsDataLagged24h, realTripsDataLagged48h, realTripsDataLagged168h, weatherData)
        forecastTripDayData = get_model_forecast(rentalsModelData, returnsModelData, dateTime,  station_id)
        trip_day_data_dao.add_forecast(dateTime, station_id,  forecastTripDayData)
        return forecastTripDayData


def get_model_data(realTripsDataLagged24h, realTripsDataLagged48h, realTripsDataLagged168h, weatherData):
    rentals24, rentals48, rentals168 = [], [], []
    returns24, returns48, returns168 = [], [], []
    temperatures, humidities = [], []

    for i in range(0, len(realTripsDataLagged24h.rentals)):
        rentals24.append(np.log1p(int(realTripsDataLagged24h.rentals.__getitem__(i).value)))
        returns24.append(np.log1p(int(realTripsDataLagged24h.returns.__getitem__(i).value)))
        rentals48.append(np.log1p(int(realTripsDataLagged48h.rentals.__getitem__(i).value)))
        returns48.append(np.log1p(int(realTripsDataLagged48h.returns.__getitem__(i).value)))
        rentals168.append(np.log1p(int(realTripsDataLagged168h.rentals.__getitem__(i).value)))
        returns168.append(np.log1p(int(realTripsDataLagged168h.returns.__getitem__(i).value)))
        temperatures.append(weatherData.temperatures.__getitem__(i).value)
        humidities.append(weatherData.humidities.__getitem__(i).value)

    rentalsModelData = np.append(np.append(rentals168, rentals48), rentals24)
    rentalsModelData = np.append(np.append(temperatures, humidities), rentalsModelData).reshape(-1, 5, 24)
    rentalsModelData_transposed = np.empty((len(rentalsModelData), 24, 5))
    for i in range(0, len(rentalsModelData)):
        rentalsModelData_transposed[i] = rentalsModelData[i].transpose()
    rentalsModelData = rentalsModelData_transposed

    returnsModelData = np.append(np.append(returns168, returns48), returns24)
    returnsModelData = np.append(np.append(temperatures, humidities), returnsModelData).reshape(-1, 5, 24)
    returnsModelData_transposed = np.empty((len(returnsModelData), 24, 5))
    for i in range(0, len(returnsModelData)):
        returnsModelData_transposed[i] = returnsModelData[i].transpose()
    returnsModelData = returnsModelData_transposed

    return rentalsModelData, returnsModelData

def get_model_forecast(rentalsModelData, returnsModelData, date,  station_id):
    import os
    print(os.getcwd())
    json_file = open(config.get('PathsSection', 'paths.forecastDataService.modelSerialization')+'/LSTM_serialization.json', 'r')
    model = json_file.read()
    json_file.close()
    rentalsModel = model_from_json(model)
    rentalsModel.load_weights(config.get('PathsSection', 'paths.forecastDataService.weights.rentals')+'/rentals_' + station_id + '.h5')
    rentalsModel.compile(loss='mean_squared_error', optimizer='adamax', metrics=['mae'])
    rentalsPredictions = rentalsModel.predict(x=rentalsModelData, batch_size=4096, verbose=0).reshape(24)
    rentalsPredictions = np.expm1(rentalsPredictions).round(0)

    json_file = open(config.get('PathsSection', 'paths.forecastDataService.modelSerialization')+'/LSTM_serialization.json', 'r')
    model = json_file.read()
    json_file.close()
    returnsModel = model_from_json(model)
    returnsModel.load_weights(config.get('PathsSection', 'paths.forecastDataService.weights.returns')+'/returns_' + station_id + '.h5')
    returnsModel.compile(loss='mean_squared_error', optimizer='adamax', metrics=['mae'])
    returnsPredictions = returnsModel.predict(x=returnsModelData, batch_size=4096, verbose=0).reshape(24)
    returnsPredictions = np.expm1(returnsPredictions).round(0)
    rentalsList, returnsList = list(), list()
    for i in range(0, 24):
        rentalsList.append(Measure(i, int(rentalsPredictions[i])))
        returnsList.append(Measure(i, int(returnsPredictions[i])))

    predictedTripDayData = TripDayData(date, station_id, rentalsList, returnsList)
    return predictedTripDayData

