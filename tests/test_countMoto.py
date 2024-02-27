import boto3
from moto import mock_dynamodb2
import pytest

from lambda_local.main import call
from lambda_local.context import Context

context = Context(5)


# Function to create Mock table of Visitor Count Table.
@mock_dynamodb2
def test_createmockTimeTable():
    dynamodb = boto3.resource('dynamodb')
    myTable = 'visitorCountTable'
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
    from lambdaFunctions.visitorCount import lambda_handler
    # Fill the mock table with Dummy Value.
    table = test_createmockTimeTable()
    myTable = 'timeTable'
    dummyCount = 100
    table.put_item(
        TableName=myTable,
        Item={
            'id': 'keyCount',
            'itemCount': dummyCount,
        }
    )
    result = call(lambda_handler, eventDummyInfo, context)

    # Test actual response with expected value.
    expected_response = ({'Time': dummyCount + 1}, None)
    assert result == expected_response
