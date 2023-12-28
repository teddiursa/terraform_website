import json
import boto3

# Set table as the DynamoDB Visitor Count Table.
dynamodb = boto3.resource('dynamodb')
ddbTableName = 'visitorCountTable'
table = dynamodb.Table(ddbTableName)


# Function to get the current website visitor count, increment it, and
# return current count.
def lambda_handler(event, context):
    # Get current visitor count.
    response = table.get_item(Key={'id': 'keyCount'})
    oldCount = response["Item"]["itemCount"]
    # Increment count and update the table.
    newCount = str(int(oldCount)+1)
    response = table.update_item(
        Key={'id': 'keyCount'},
        UpdateExpression='set itemCount = :c',
        ExpressionAttributeValues={':c': newCount},
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
            'Count': newCount
        })
    }
