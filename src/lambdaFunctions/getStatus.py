import http.client
import json

OK = int(200)

def lambda_handler(event, context):
    conn = http.client.HTTPSConnection("gregchow.net")
    conn.request("GET","/")
    response = conn.getresponse()
    if response.status is OK:
        responseCode = 'Up'
    else:
        responseCode = 'Down'
    
    return {
        "statusCode": OK,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': 'https://www.gregchow.net',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({
            'Status': responseCode
        })
    }
    
