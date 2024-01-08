import pytest
import time

from lambda_local.main import call
from lambda_local.context import Context
from lambdaFunctions.clearCache import lambda_handler

context = Context(5)


@pytest.fixture(scope='function')
def test_clearCache(eventDummyInfo):
    result = call(lambda_handler, eventDummyInfo, context)

    # Expect to get a status of Working
    expected_response = (
        {'message': 'Cache invalidated for CloudFront distributions'}, None)
    # Wait for website to load for set time
    wait = 1
    time.sleep(wait)

    assert result == expected_response
