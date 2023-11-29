import os
import boto3
import boto3.dynamodb.conditions as conditions

import pytest


# dummy info for calling lambda functions

@pytest.fixture(scope="module")
def eventDummyInfo():
    return {
        "dummy " : "info" 
    }

# @pytest.fixture
# def lambda_environment():
#     os.environ[lambda_handler.ENV_TABLE_NAME] = timeTable


@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


# @pytest.fixture
# def dynamodb_client(aws_credentials):
#     """DynamoDB mock client."""
#     with mock_dynamodb():
#         conn = boto3.client("dynamodb", region_name="us-east-1")
#         yield conn

# @pytest.fixture
# def mocktimeTable():
#     with moto.mock_dynamodb():
#         client = boto3.client("dynamodb")
#         myTable = client.create_table(
#             AttributeDefinitions=[
#                 {"AttributeName": "itemTime", "AttributeType": "S"}
#             ],
#             TableName='timeTable',
#             KeySchema=[
#                 {"AttributeName": "keyTime", "KeyType": "S"}
#             ],
#             BillingMode="PAY_PER_REQUEST"
#         )
#         myTable.put_item(
#             Item={
#                 'itemTime': '1700076925',
#             }
#         )

#         yield myTable
