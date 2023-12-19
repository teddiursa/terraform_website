import os
import boto3
import boto3.dynamodb.conditions as conditions

import pytest
import moto

# Dummy info for calling lambda functions.

@pytest.fixture(scope="module")
def eventDummyInfo():
    return {
        "dummy " : "info" 
    }

@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
