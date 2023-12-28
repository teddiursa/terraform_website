import http.client
import json


# Function to check if website is currently up.
def lambda_handler(event, context):
    conn = http.client.HTTPSConnection("gregchow.net")
    conn.request("GET", "/")
    response = conn.getresponse()
    # Check if website is current responding with HTTP OK.
    if response.status == 200:
        responseCode = 'Up'
    else:
        responseCode = 'Down'
    # Return valid HTTP response with CORS.
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({
            'Status': responseCode
        })
    }
