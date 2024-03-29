import boto3
from moto import mock_aws

import pytest
import time
import math

from lambda_local.main import call
from lambda_local.context import Context
from lambdaFunctions.timeCount import lambda_handler

context = Context(5)


# Function to create mock table of Visitor Time Table.
def test_createmockTimeTable():
    with mock_aws():
        dynamodb = boto3.resource('dynamodb')
        myTable = 'timeTable'
        table = dynamodb.create_table(
            TableName=myTable,
            KeySchema=[{'AttributeName': 'id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'S'}
                ],
            BillingMode="PAY_PER_REQUEST"
            )
        assert table


@pytest.fixture(scope='function')
def test_mockTimeTable(eventDummyInfo):
    # Create mock table with current time as it's value.
    table = test_createmockTimeTable()
    myTable = 'timeTable'
    currTime = math.trunc(time.time())
    table.put_item(
        TableName=myTable,
        Item={
            'id': 'keyTime',
            'itemTime': currTime,
        }
    )
    wait = 1
    # Wait for set time.
    time.sleep(wait)
    result = call(lambda_handler, eventDummyInfo, context)

    # Expect to get set time as response.
    expected_response = ({'Time': wait}, None)

    assert result == expected_response
