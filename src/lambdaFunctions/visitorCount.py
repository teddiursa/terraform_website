import json
import boto3

# set table as the DynamoDB Visitor Count Table 
dynamodb = boto3.resource('dynamodb')
ddbTableName = 'visitorCountTable'
table = dynamodb.Table(ddbTableName)

def lambda_handler(event, context):
    # get current visitor count
    response = table.get_item(Key= {'id' : 'keyCount'} )
    oldCount = response["Item"]["itemCount"]
    # increment count and update the table
    newCount = str(int(oldCount)+1)
    response = table.update_item(
        Key={'id': 'keyCount'},
        UpdateExpression='set itemCount = :c',
        ExpressionAttributeValues={':c': newCount},
        ReturnValues='UPDATED_NEW'
        )

    # return valid HTTP response with CORS
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({
            'Count': newCount
        })
    }