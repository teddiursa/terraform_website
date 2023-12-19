import pytest
import time

from lambda_local.main import call  
from lambda_local.context import Context
from lambdaFunctions.getStatus import lambda_handler

context = Context(5)  

@pytest.fixture(scope='function')
def test_getStatus(eventDummyInfo):
    result = call(lambda_handler, eventDummyInfo, context)

    # Expect to get a status of UP.
    expected_response = ({'Status': 'Up'}, None)
    # Wait for website to load for set time
    wait = 1
    time.sleep(wait)

    assert result == expected_response

