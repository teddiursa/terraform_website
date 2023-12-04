# import boto3
# #from moto import dynamodb
# import moto
# from moto import mock_dynamodb
# from moto import mock_lambda

# from collections import namedtuple

import pytest
import time

from lambda_local.main import call  
from lambda_local.context import Context
from lambdaFunctions.getStatus import lambda_handler

context = Context(5)  


@pytest.fixture(scope='function')
def test_getStatus(eventDummyInfo):
    result = call(lambda_handler, eventDummyInfo, context)

    # expect to get a status of "UP"
    expected_response = ({'Status': 'Up'}, None)
    # wait for website to load
    wait = 1
    time.sleep(wait)

    assert result == expected_response

