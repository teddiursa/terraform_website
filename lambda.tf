data "archive_file" "visitorCountPackage" {  
  type = "zip"  
  source_file = "${path.module}/src/lambdaFunctions/visitorCount.py" 
  output_path = "visitorCount.zip"
}

resource "aws_lambda_function" "visitorCountFunction" {
        function_name = "visitorCount"
        filename      = "visitorCount.zip"
        source_code_hash = data.archive_file.visitorCountPackage.output_base64sha256
        role          = aws_iam_role.lambdaRole.arn
        runtime       = "python3.11"
        handler       = "visitorCount.lambda_handler"
        timeout       = 10
}


data "archive_file" "timePackage" {  
  type = "zip"  
  source_file = "${path.module}/src/lambdaFunctions/timeCount.py" 
  output_path = "timeCount.zip"
}

resource "aws_lambda_function" "timeFunction" {
        function_name = "timeCount"
        filename      = "timeCount.zip"
        source_code_hash = data.archive_file.timePackage.output_base64sha256
        role          = aws_iam_role.lambdaRole.arn
        runtime       = "python3.11"
        handler       = "timeCount.lambda_handler"
        timeout       = 10
}

data "archive_file" "statusPackage" {  
  type = "zip"  
  source_file = "${path.module}/src/lambdaFunctions/getStatus.py" 
  output_path = "getStatus.zip"
}

resource "aws_lambda_function" "statusFunction" {
        function_name = "getStatus"
        filename      = "getStatus.zip"
        source_code_hash = data.archive_file.statusPackage.output_base64sha256
        role          = aws_iam_role.lambdaRole.arn
        runtime       = "python3.11"
        handler       = "getStatus.lambda_handler"
        timeout       = 10
}

resource "aws_lambda_permission" "allowStatus" {
  statement_id  = "AllowApiStatusGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.statusFunction.function_name
  principal     = "events.amazonaws.com"
  source_arn    = "arn:aws:events:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.statusApi.id}/*/*/*"
}

data "archive_file" "cachePackage" {  
  type = "zip"  
  source_file = "${path.module}/src/lambdaFunctions/clearCache.py" 
  output_path = "clearCache.zip"
}

resource "aws_lambda_function" "cacheFunction" {
        function_name = "clearCache"
        filename      = "clearCache.zip"
        source_code_hash = data.archive_file.cachePackage.output_base64sha256
        role          = aws_iam_role.cacheRole.arn
        runtime       = "python3.11"
        handler       = "clearCache.lambda_handler"
        timeout       = 10
}

resource "aws_lambda_permission" "allowCache" {
  statement_id  = "AllowApiCacheGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cacheFunction.function_name
  principal     = "events.amazonaws.com"
  source_arn    = "arn:aws:events:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.cacheApi.id}/*/*/*"
}

resource "aws_lambda_permission" "allowCount" {
  statement_id  = "AllowApicountGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitorCountFunction.function_name
  principal     = "events.amazonaws.com"
  source_arn    = "arn:aws:events:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.countApi.id}/*/*/*"
}

resource "aws_lambda_permission" "allowTime" {
  statement_id  = "AllowApitimeGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.timeFunction.function_name
  principal     = "events.amazonaws.com"
  source_arn    = "arn:aws:events:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.timeApi.id}/*/*/*"
}