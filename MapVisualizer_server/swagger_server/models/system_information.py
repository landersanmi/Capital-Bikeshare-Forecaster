# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from swagger_server.models.base_model_ import Model
from swagger_server import util


class SystemInformation(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, name: str=None, operator: str=None, url: str=None, phone_number: str=None, email: str=None, timezone: str=None, license_url: str=None, start_date: str=None):  # noqa: E501
        """SystemInformation - a model defined in Swagger

        :param name: The name of this SystemInformation.  # noqa: E501
        :type name: str
        :param operator: The operator of this SystemInformation.  # noqa: E501
        :type operator: str
        :param url: The url of this SystemInformation.  # noqa: E501
        :type url: str
        :param phone_number: The phone_number of this SystemInformation.  # noqa: E501
        :type phone_number: str
        :param email: The email of this SystemInformation.  # noqa: E501
        :type email: str
        :param timezone: The timezone of this SystemInformation.  # noqa: E501
        :type timezone: str
        :param license_url: The license_url of this SystemInformation.  # noqa: E501
        :type license_url: str
        :param start_date: The start_date of this SystemInformation.  # noqa: E501
        :type start_date: str
        """
        self.swagger_types = {
            'name': str,
            'operator': str,
            'url': str,
            'phone_number': str,
            'email': str,
            'timezone': str,
            'license_url': str,
            'start_date': str
        }

        self.attribute_map = {
            'name': 'name',
            'operator': 'operator',
            'url': 'url',
            'phone_number': 'phone_number',
            'email': 'email',
            'timezone': 'timezone',
            'license_url': 'license_url',
            'start_date': 'start_date'
        }
        self._name = name
        self._operator = operator
        self._url = url
        self._phone_number = phone_number
        self._email = email
        self._timezone = timezone
        self._license_url = license_url
        self._start_date = start_date

    @classmethod
    def from_dict(cls, dikt) -> 'SystemInformation':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The system_information of this SystemInformation.  # noqa: E501
        :rtype: SystemInformation
        """
        return util.deserialize_model(dikt, cls)

    @property
    def name(self) -> str:
        """Gets the name of this SystemInformation.

        Name of the company  # noqa: E501

        :return: The name of this SystemInformation.
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name: str):
        """Sets the name of this SystemInformation.

        Name of the company  # noqa: E501

        :param name: The name of this SystemInformation.
        :type name: str
        """

        self._name = name

    @property
    def operator(self) -> str:
        """Gets the operator of this SystemInformation.

        Operator of the company  # noqa: E501

        :return: The operator of this SystemInformation.
        :rtype: str
        """
        return self._operator

    @operator.setter
    def operator(self, operator: str):
        """Sets the operator of this SystemInformation.

        Operator of the company  # noqa: E501

        :param operator: The operator of this SystemInformation.
        :type operator: str
        """

        self._operator = operator

    @property
    def url(self) -> str:
        """Gets the url of this SystemInformation.

        URL to the company homepage  # noqa: E501

        :return: The url of this SystemInformation.
        :rtype: str
        """
        return self._url

    @url.setter
    def url(self, url: str):
        """Sets the url of this SystemInformation.

        URL to the company homepage  # noqa: E501

        :param url: The url of this SystemInformation.
        :type url: str
        """

        self._url = url

    @property
    def phone_number(self) -> str:
        """Gets the phone_number of this SystemInformation.

        Phone of the company  # noqa: E501

        :return: The phone_number of this SystemInformation.
        :rtype: str
        """
        return self._phone_number

    @phone_number.setter
    def phone_number(self, phone_number: str):
        """Sets the phone_number of this SystemInformation.

        Phone of the company  # noqa: E501

        :param phone_number: The phone_number of this SystemInformation.
        :type phone_number: str
        """

        self._phone_number = phone_number

    @property
    def email(self) -> str:
        """Gets the email of this SystemInformation.

        Email of the company  # noqa: E501

        :return: The email of this SystemInformation.
        :rtype: str
        """
        return self._email

    @email.setter
    def email(self, email: str):
        """Sets the email of this SystemInformation.

        Email of the company  # noqa: E501

        :param email: The email of this SystemInformation.
        :type email: str
        """

        self._email = email

    @property
    def timezone(self) -> str:
        """Gets the timezone of this SystemInformation.

        Timezone of the company  # noqa: E501

        :return: The timezone of this SystemInformation.
        :rtype: str
        """
        return self._timezone

    @timezone.setter
    def timezone(self, timezone: str):
        """Sets the timezone of this SystemInformation.

        Timezone of the company  # noqa: E501

        :param timezone: The timezone of this SystemInformation.
        :type timezone: str
        """

        self._timezone = timezone

    @property
    def license_url(self) -> str:
        """Gets the license_url of this SystemInformation.

        URL to the company license  # noqa: E501

        :return: The license_url of this SystemInformation.
        :rtype: str
        """
        return self._license_url

    @license_url.setter
    def license_url(self, license_url: str):
        """Sets the license_url of this SystemInformation.

        URL to the company license  # noqa: E501

        :param license_url: The license_url of this SystemInformation.
        :type license_url: str
        """

        self._license_url = license_url

    @property
    def start_date(self) -> str:
        """Gets the start_date of this SystemInformation.

        The creation day of the system  # noqa: E501

        :return: The start_date of this SystemInformation.
        :rtype: str
        """
        return self._start_date

    @start_date.setter
    def start_date(self, start_date: str):
        """Sets the start_date of this SystemInformation.

        The creation day of the system  # noqa: E501

        :param start_date: The start_date of this SystemInformation.
        :type start_date: str
        """

        self._start_date = start_date
