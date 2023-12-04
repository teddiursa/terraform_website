import http.client

def lambda_handler(event, context):
    conn = http.client.HTTPConnection("https://www.gregchow.net")
    conn.request("GET", "/")
    response = conn.getresponse()
    #print(response.status, response.reason)
    OK = int(200)
    if response.status is OK:
        return {'Status': 'Up'}
    else:
        return {'Status': 'Down'}
