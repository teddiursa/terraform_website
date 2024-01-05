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
          "Sid" : "cfflistbuckets",
          "Action" : [
            "s3:ListAllMyBuckets"
          ],
          "Effect" : "Allow",
          "Resource" : "arn:aws:s3:::*"
        },
        {
          "Sid" : "cffullaccess",
          "Action" : [
            "acm:ListCertificates",
            "cloudfront:*",
            "cloudfront-keyvaluestore:*",
            "iam:ListServerCertificates",
            "waf:ListWebACLs",
            "waf:GetWebACL",
            "wafv2:ListWebACLs",
            "wafv2:GetWebACL",
            "kinesis:ListStreams"
          ],
          "Effect" : "Allow",
          "Resource" : "*"
        },
        {
          "Sid" : "cffdescribestream",
          "Action" : [
            "kinesis:DescribeStream"
          ],
          "Effect" : "Allow",
          "Resource" : "arn:aws:kinesis:*:*:*"
        },
        {
          "Sid" : "cfflistroles",
          "Action" : [
            "iam:ListRoles"
          ],
          "Effect" : "Allow",
          "Resource" : "arn:aws:iam::*:*"
        }
      ]
    }
  )
}



