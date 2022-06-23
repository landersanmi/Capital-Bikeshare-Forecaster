import requests
from swagger_server.models.system_information import SystemInformation
import configparser

config = configparser.RawConfigParser()
config.read('swagger_server/MapVisualizer_server.ini')

GBFS_SYSTEM_INFOR_URL = config.get('DataSection', 'data.gbfsSystemInformationURL')

def get_system_information():
    req_get_system_inf = requests.get(GBFS_SYSTEM_INFOR_URL).json()['data']
    information_params = ["name", "operator", "url", "phone_number", "email", "timezone", "license_url", "start_date"]
    information = dict()
    for param in information_params:
        try:
            information[param] = req_get_system_inf[param]
        except:
            print("{} does not exist".format(param))
    return SystemInformation.from_dict(information)