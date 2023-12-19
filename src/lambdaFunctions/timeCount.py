import json
import boto3
from datetime import datetime
from decimal import Decimal
import math

# Set table as the DynamoDB Visitor Time Table.
dynamodb = boto3.resource('dynamodb')
ddbTableName = 'timeTable'
table = dynamodb.Table(ddbTableName)

# Function to get the time the website was last accessed, compare it to the current time,
# update the stored time to current time, and return the time difference. 
def lambda_handler(event, context):
    response = table.get_item(Key= {'id' : 'keyTime'} )
    oldTime = Decimal(response["Item"]["itemTime"])
    currTime = Decimal(datetime.now().timestamp())

    # Get time offeset and remove decimal place.
    timeSince = math.trunc(currTime - oldTime)

    # Update table to current time.
    response = table.update_item(
        Key={'id': 'keyTime'},
        UpdateExpression='set itemTime = :c',
        ExpressionAttributeValues={':c': currTime},
        ReturnValues='UPDATED_NEW'
        )
    
    # Return valid HTTP response with CORS.
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({
            'Time': timeSince
        })
    }