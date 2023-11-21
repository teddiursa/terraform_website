data "archive_file" "visitorCountPackage" {  
  type = "zip"  
  source_file = "${path.module}/code/visitorCount.py" 
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
  source_file = "${path.module}/code/timeCount.py" 
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
