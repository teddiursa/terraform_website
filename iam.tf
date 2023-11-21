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
            "Resource": [
                "arn:aws:dynamodb:us-east-1:661250114429:table/*",
                "arn:aws:lambda:*:661250114429:function:*",
                "arn:aws:iam::661250114429:role/*",
                "arn:aws:iam::661250114429:policy/*",
                "arn:aws:iam::661250114429:user/*"
            ]
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

