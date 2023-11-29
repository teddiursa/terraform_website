import boto3
#from moto import dynamodb
from moto import mock_dynamodb
from moto import mock_lambda

from collections import namedtuple

import pytest
import time
import math

from lambda_local.main import call  
from lambda_local.context import Context
from lambdaFunctions.timeCount import lambda_handler

context = Context(5)  

@mock_dynamodb
def test_createmockTimeTable():
    dynamodb = boto3.resource('dynamodb')
    myTable = 'timeTable'
    #create mock table
    table = dynamodb.create_table(TableName=myTable,
        KeySchema=[{'AttributeName': 'id','KeyType': 'HASH'}],
        AttributeDefinitions=[
            {'AttributeName': 'id','AttributeType': 'S'}
            ],
        BillingMode = "PAY_PER_REQUEST"    
        )
    assert table

@pytest.fixture(scope='function')
def test_mockTimeTable(eventDummyInfo):
    table = test_createmockTimeTable()
    myTable = 'timeTable'
    currTime = math.trunc(time.time())
    table.put_item(
        TableName=myTable,
        Item={
            'id' : 'keyTime',
            'itemTime':currTime,
        }
    )
    wait = 1;
    # wait for set time
    time.sleep(wait)
    # get time again, which should be the time waited
    result = call(lambda_handler, eventDummyInfo, context)

    # expect to get 1 second as response
    expected_response = ({'Time': wait}, None)

    assert result == expected_response




