resource "aws_api_gateway_rest_api" "statusApi" {
  name        = "statusGateway"
  description = "API gateway for get Status Lambda Function"
}

resource "aws_api_gateway_resource" "statusProxy" {
  rest_api_id = "${aws_api_gateway_rest_api.statusApi.id}"
  parent_id   = "${aws_api_gateway_rest_api.statusApi.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "statusProxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.statusApi.id}"
  resource_id   = "${aws_api_gateway_resource.statusProxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "statusLambda" {
  rest_api_id = "${aws_api_gateway_rest_api.statusApi.id}"
  resource_id = "${aws_api_gateway_method.statusProxy.resource_id}"
  http_method = "${aws_api_gateway_method.statusProxy.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.statusFunction.invoke_arn}"
}

resource "aws_api_gateway_method" "statusProxyRoot" {
  rest_api_id   = "${aws_api_gateway_rest_api.statusApi.id}"
  resource_id   = "${aws_api_gateway_rest_api.statusApi.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "statusLambdaRoot" {
  rest_api_id = "${aws_api_gateway_rest_api.statusApi.id}"
  resource_id = "${aws_api_gateway_method.statusProxyRoot.resource_id}"
  http_method = "${aws_api_gateway_method.statusProxyRoot.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.statusFunction.invoke_arn}"
}

resource "aws_api_gateway_deployment" "statusDeployment" {
  depends_on = [
    aws_api_gateway_integration.statusLambda,
    aws_api_gateway_integration.statusLambdaRoot,
  ]

  rest_api_id = "${aws_api_gateway_rest_api.statusApi.id}"
  stage_name  = "statusStage"
}

#Count API Gateway

resource "aws_api_gateway_rest_api" "countApi" {
  name        = "countGateway"
  description = "API gateway for get count Lambda Function"
}

resource "aws_api_gateway_resource" "countProxy" {
  rest_api_id = "${aws_api_gateway_rest_api.countApi.id}"
  parent_id   = "${aws_api_gateway_rest_api.countApi.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "countProxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.countApi.id}"
  resource_id   = "${aws_api_gateway_resource.countProxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "countLambda" {
  rest_api_id = "${aws_api_gateway_rest_api.countApi.id}"
  resource_id = "${aws_api_gateway_method.countProxy.resource_id}"
  http_method = "${aws_api_gateway_method.countProxy.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.visitorCountFunction.invoke_arn}"
}

resource "aws_api_gateway_method" "countProxyRoot" {
  rest_api_id   = "${aws_api_gateway_rest_api.countApi.id}"
  resource_id   = "${aws_api_gateway_rest_api.countApi.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "countLambdaRoot" {
  rest_api_id = "${aws_api_gateway_rest_api.countApi.id}"
  resource_id = "${aws_api_gateway_method.countProxyRoot.resource_id}"
  http_method = "${aws_api_gateway_method.countProxyRoot.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.visitorCountFunction.invoke_arn}"
}

resource "aws_api_gateway_deployment" "countDeployment" {
  depends_on = [
    aws_api_gateway_integration.countLambda,
    aws_api_gateway_integration.countLambdaRoot,
  ]

  rest_api_id = "${aws_api_gateway_rest_api.countApi.id}"
  stage_name  = "countStage"
}

# Time API Gateway
resource "aws_api_gateway_rest_api" "timeApi" {
  name        = "timeGateway"
  description = "API gateway for get time Lambda Function"
}

resource "aws_api_gateway_resource" "timeProxy" {
  rest_api_id = "${aws_api_gateway_rest_api.timeApi.id}"
  parent_id   = "${aws_api_gateway_rest_api.timeApi.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "timeProxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.timeApi.id}"
  resource_id   = "${aws_api_gateway_resource.timeProxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "timeLambda" {
  rest_api_id = "${aws_api_gateway_rest_api.timeApi.id}"
  resource_id = "${aws_api_gateway_method.timeProxy.resource_id}"
  http_method = "${aws_api_gateway_method.timeProxy.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.timeFunction.invoke_arn}"
}

resource "aws_api_gateway_method" "timeProxyRoot" {
  rest_api_id   = "${aws_api_gateway_rest_api.timeApi.id}"
  resource_id   = "${aws_api_gateway_rest_api.timeApi.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "timeLambdaRoot" {
  rest_api_id = "${aws_api_gateway_rest_api.timeApi.id}"
  resource_id = "${aws_api_gateway_method.timeProxyRoot.resource_id}"
  http_method = "${aws_api_gateway_method.timeProxyRoot.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.timeFunction.invoke_arn}"
}

resource "aws_api_gateway_deployment" "timeDeployment" {
  depends_on = [
    aws_api_gateway_integration.timeLambda,
    aws_api_gateway_integration.timeLambdaRoot,
  ]

  rest_api_id = "${aws_api_gateway_rest_api.timeApi.id}"
  stage_name  = "timeStage"
}