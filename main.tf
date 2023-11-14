provider "aws"{
    region = "us-east-1"
}

variable "domainName" {
  default = "gregchow.net"
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