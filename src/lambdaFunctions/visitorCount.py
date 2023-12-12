import json
import boto3

dynamodb = boto3.resource('dynamodb')
ddbTableName = 'visitorCountTable'
table = dynamodb.Table(ddbTableName)

def lambda_handler(event, context):

    response = table.get_item(Key= {'id' : 'keyCount'} )
    oldCount = response["Item"]["itemCount"]

    newCount = str(int(oldCount)+1)
    response = table.update_item(
        Key={'id': 'keyCount'},
        UpdateExpression='set itemCount = :c',
        ExpressionAttributeValues={':c': newCount},
        ReturnValues='UPDATED_NEW'
        )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': 'https://www.gregchow.net',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({
            'Time': newCount
        })
    }