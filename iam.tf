resource "aws_iam_role" "lambdaRole" {
  name = "lambda-lambdaRole-terraform"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "dynamodbPolicy" {
  name = "dynamodbPolicy"
  role = aws_iam_role.lambdaRole.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "VisualEditor0",
          "Effect" : "Allow",
          "Action" : [
            "lambda:CreateFunction",
            "dynamodb:DeleteItem",
            "iam:TagRole",
            "iam:DeletePolicy",
            "iam:CreateRole",
            "iam:AttachRolePolicy",
            "dynamodb:DeleteTable",
            "iam:CreateUser",
            "iam:PassRole",
            "dynamodb:TagResource",
            "dynamodb:DescribeTable",
            "dynamodb:GetItem",
            "lambda:DeleteFunction",
            "lambda:GetAlias",
            "dynamodb:BatchGetItem",
            "iam:GetRole",
            "lambda:InvokeFunctionUrl",
            "dynamodb:UntagResource",
            "dynamodb:PutItem",
            "iam:GetPolicy",
            "lambda:InvokeFunction",
            "lambda:GetFunction",
            "lambda:ListAliases",
            "iam:DeleteRole",
            "dynamodb:UpdateItem",
            "iam:TagPolicy",
            "iam:TagUser",
            "lambda:UpdateAlias",
            "dynamodb:CreateTable",
            "iam:CreatePolicy",
            "lambda:UpdateFunctionCode",
            "iam:UpdateRole",
            "iam:GetRolePolicy",
            "dynamodb:UpdateTable",
            "lambda:GetPolicy"
          ],
          "Resource" : [
            "arn:aws:dynamodb:us-east-1:${var.accountId}:table/*",
            "arn:aws:lambda:*:${var.accountId}:function:*",
            "arn:aws:iam::${var.accountId}:role/*",
            "arn:aws:iam::${var.accountId}:policy/*",
            "arn:aws:iam::${var.accountId}:user/*",
            "arn:aws:apigateway:us-east-1::/restapis/*",
            "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.statusApi.id}/*/${aws_api_gateway_method.statusProxyRoot.http_method}${aws_api_gateway_resource.statusProxy.path}",
            "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.timeApi.id}/*/${aws_api_gateway_method.timeProxyRoot.http_method}${aws_api_gateway_resource.timeProxy.path}",
            "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.countApi.id}/*/${aws_api_gateway_method.countProxyRoot.http_method}${aws_api_gateway_resource.countProxy.path}"
          ]
        },
        {
          "Sid" : "VisualEditor1",
          "Effect" : "Allow",
          "Action" : [
            "lambda:ListFunctions",
            "dynamodb:ListTables"
          ],
          "Resource" : "*"
        }
      ]

  })
}

# Role for Lambda function to refresh cloudfront distribution cache

resource "aws_iam_role" "cacheRole" {
  name = "lambda-cacheRole-terraform"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
}



resource "aws_iam_role_policy" "cachePolicy" {
  name = "cachePolicy"
  role = aws_iam_role.cacheRole.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "AllowLambdaAndApiGatewayAccess",
          "Effect" : "Allow",
          "Action" : [
            "lambda:*",
            "apigateway:*",
            "iam:*"
          ],
          "Resource" : [
            "arn:aws:lambda:*:${var.accountId}:function:*",
            "arn:aws:iam::${var.accountId}:role/*",
            "arn:aws:iam::${var.accountId}:policy/*",
            "arn:aws:iam::${var.accountId}:user/*",
            "arn:aws:apigateway:us-east-1::/restapis/*",
            "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.cacheApi.id}/*/${aws_api_gateway_method.cacheProxyRoot.http_method}${aws_api_gateway_resource.cacheProxy.path}"
          ]
        },
        {
          "Sid" : "AllowApiGatewayInvoke",
          "Effect" : "Allow",
          "Action" : "lambda:InvokeFunction",
          "Resource" : "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.cacheApi.id}/*/${aws_api_gateway_method.cacheProxyRoot.http_method}${aws_api_gateway_resource.cacheProxy.path}"
        },
        {
          "Sid" : "AllowCloudFrontAccess",
          "Effect" : "Allow",
          "Action" : [
            "cloudfront:CreateInvalidation",
            "cloudfront:ListDistributions"
          ],
          "Resource" : "*"
        }
      ]
    }
  )
}

# User for the homelab metrics publisher (ansible_proxmox/roles/metrics_publisher).
# Its credentials live on the docker host, outside AWS, so the policy is scoped
# to exactly one action on exactly one object key - nothing else in the account
# is reachable if that host is ever compromised.

resource "aws_iam_user" "metricsPublisher" {
  name = "homelab-metrics-publisher"
  tags = {
    Name        = "metricsPublisher"
    Environment = "Prod"
  }
}

resource "aws_iam_user_policy" "metricsPublisherPolicy" {
  name = "metricsPublisherPolicy"
  user = aws_iam_user.metricsPublisher.name
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "PutMetricsSnapshotOnly",
          "Effect" : "Allow",
          "Action" : "s3:PutObject",
          "Resource" : "${aws_s3_bucket.jsonBucket.arn}/metrics.json"
        }
      ]
    }
  )
}

# The access key is deliberately NOT managed here: aws_iam_access_key stores
# the secret in plaintext in the state file. Mint it once by hand instead:
#
#   aws iam create-access-key --user-name homelab-metrics-publisher
#
# then store the pair in the Ansible vault (group_vars/metrics.yml) as
# metrics_aws_access_key_id and metrics_aws_secret_access_key.
