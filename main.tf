provider "aws" {
  region = "us-east-1"
}

variable "domainName" {
  default = "gregchow.net"
}

variable "fullDomainName" {
  default = "www.gregchow.net"
}

variable "accountId" {
  default = "661250114429"
}

##outputs
output "s3_url" {
  description = "S3 hosting URL (HTTP)"
  value       = aws_s3_bucket_website_configuration.terraformWebsite.website_endpoint
}

output "website_url" {
  description = "Website URL (HTTPS)"
  value       = aws_cloudfront_distribution.distribution.domain_name
}

output "validation" {
  value = aws_route53_record.record.*.fqdn
}

output "status_API_Gateway" {
  value = "${aws_api_gateway_deployment.statusDeployment.invoke_url}"
}

output "iam"{
  value = "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.statusApi.id}/*/${aws_api_gateway_method.statusProxyRoot.http_method}${aws_api_gateway_resource.statusProxy.path}"
}


output "iamTime"{
  value = "arn:aws:execute-api:us-east-1:${var.accountId}:${aws_api_gateway_rest_api.timeApi.id}/*/${aws_api_gateway_method.timeProxyRoot.http_method}${aws_api_gateway_resource.timeProxy.path}"
}