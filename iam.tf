# data "aws_iam_policy_document" "lambdaPolicy"{
#   statement {
#     effect  = "Allow"
#     actions = ["sts:AssumeRole"]
#     principals {
#       type        = "Service"
#       identifiers = ["lambda.amazonaws.com"]
#     }
#   }
# }


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
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
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
            # "Resource": [
            #     "arn:aws:dynamodb:us-east-1:661250114429:table/*",
            #     "arn:aws:lambda:*:661250114429:function:*",
            #     "arn:aws:iam::661250114429:role/*",
            #     "arn:aws:iam::661250114429:policy/*",
            #     "arn:aws:iam::661250114429:user/*"
            # ]
              "Resource": [
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
            #  source_arn = "arn:aws:execute-api:${var.myregion}:${var.accountId}:${aws_api_gateway_rest_api.api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.resource.path}"

        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "lambda:ListFunctions",
                "dynamodb:ListTables"
            ],
            "Resource": "*"
        }
    ]

  })
}

