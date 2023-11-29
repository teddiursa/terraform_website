# test_visitorCount.py
from collections import namedtuple

import pytest

from lambda_local.main import call  
from lambda_local.context import Context 

from lambdaFunctions.visitorCount import lambda_handler

context = Context(5)  

def test_visitorCount(eventDummyInfo):
    #get old count and add one
    result = call(lambda_handler, eventDummyInfo, context)
    #call upon first element of tuple, which is a dict. then get the last count and increment
    lastCount = int(result[0]['Count']) + 1

    #get new count
    result = call(lambda_handler, eventDummyInfo, context)

    #check it's properly incrementing
    expected_response = ({'Count': str(lastCount)}, None)
    
    assert result == expected_response
