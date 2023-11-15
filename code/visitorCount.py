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
        UpdateExpression='set keyCount = :c',
        ExpressionAttributeValues={':c': newCount},
        ReturnValues='UPDATED_NEW'
        )

    return {'Count':newCount}