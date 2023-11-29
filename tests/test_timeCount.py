# test_timeCount.py
from collections import namedtuple

import pytest
import time

from lambda_local.main import call  
from lambda_local.context import Context

from lambdaFunctions.timeCount import lambda_handler

context = Context(5)  

def test_timeCount(eventDummyInfo):
    # call function to refresh time
    result = call(lambda_handler, eventDummyInfo, context)
    #set the wait time in a variable for additional testing
    wait = 1;
    # wait for set time
    time.sleep(wait)
    # get time again, which should be the time waited
    result = call(lambda_handler, eventDummyInfo, context)

    # expect to get 1 second as response
    expected_response = ({'Time': wait}, None)

    assert result == expected_response
