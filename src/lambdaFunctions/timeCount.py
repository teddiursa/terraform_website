import json
import boto3
from datetime import datetime
from decimal import Decimal
import math

dynamodb = boto3.resource('dynamodb')
ddbTableName = 'timeTable'
table = dynamodb.Table(ddbTableName)

def lambda_handler(event, context):

    response = table.get_item(Key= {'id' : 'keyTime'} )
    oldTime = Decimal(response["Item"]["itemTime"])
    currTime = Decimal(datetime.now().timestamp())
    # get time offeset and remove decimal place
    timeSince = math.trunc(currTime - oldTime)
    #update table  to new time
    response = table.update_item(
        Key={'id': 'keyTime'},
        UpdateExpression='set itemTime = :c',
        ExpressionAttributeValues={':c': currTime},
        ReturnValues='UPDATED_NEW'
        )
    

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            'Time': timeSince
        })
    }