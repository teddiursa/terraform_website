""" Simple pytest configuration """
import pytest

def test_conf():
    """ Assert tests are configured """
    assert True

@pytest.fixture(scope="module")
def eventDummyInfo():
    return {
        "dummy " : "info" 
    }