import boto3
import json
import time


def lambda_handler(event, context):
    # Initialize the CloudFront client
    cloudfront_client = boto3.client('cloudfront')

    # Get a list of CloudFront distributions
    distributions = cloudfront_client.list_distributions()

    # Generate a unique CallerReference using timestamp
    caller_reference = str(int(time.time()))

    # Loop through the distributions and clear their caches
    for distribution in distributions['DistributionList']['Items']:
        distribution_id = distribution['Id']
        # Clear the cache for the distribution
        cloudfront_client.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ['/*']
                },
                # Use the unique CallerReference
                'CallerReference': "lambda function cleared at: "
                + caller_reference
                }
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
            'message': 'Cache invalidated for CloudFront distributions'
        })
    }
