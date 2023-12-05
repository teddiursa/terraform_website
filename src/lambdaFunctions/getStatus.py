import http.client

OK = int(200)

def lambda_handler(event, context):
    conn = http.client.HTTPSConnection("gregchow.net")
    conn.request("GET","/")
    response = conn.getresponse()
    if response.status is OK:
        return {'Status': 'Up'}
    else:
        return {'Status': 'Down'}

