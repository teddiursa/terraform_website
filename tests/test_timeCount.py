# test_timeCount.py
from collections import namedtuple

import pytest

from lambda_local.main import call  
from lambda_local.context import Context

from lambdaFunctions.timeCount import lambda_handler

context = Context(5)  

def test_timeCount(eventDummyInfo):
    result = call(lambda_handler, eventDummyInfo, context)
    # call it twice to get known time since 
    result = call(lambda_handler, eventDummyInfo, context)

    expected_response = ({'Time': 1}, None)
    assert result == expected_response
