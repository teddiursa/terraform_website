provider "aws"{
    region = "us-east-1"
}

resource "aws_s3_bucket" "terraformBucket" {
  bucket = "greg-chow-bucket"
  #acl = ""
  tags = {
    Name        = "terraformBucket"
    Environment = "Prod"
  }
}

resource "aws_s3_bucket_ownership_controls" "ownership" {
  bucket = aws_s3_bucket.terraformBucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}
resource "aws_s3_bucket_public_access_block" "pb" {
  bucket = aws_s3_bucket.terraformBucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# resource "aws_s3_bucket_acl" "acl" {
#   depends_on = [aws_s3_bucket_ownership_controls.ownership]
#   bucket = aws_s3_bucket.terraformBucket.id
#   acl    = "private"
# }

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.terraformBucket.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "PublicReadGetObject",
          "Effect" : "Allow",
          "Principal" : "*",
          "Action" : "s3:GetObject",
          "Resource" : "arn:aws:s3:::${aws_s3_bucket.terraformBucket.id}/*"
        }
      ]
    }
  )
}


resource "aws_s3_object" "html" {
  bucket = aws_s3_bucket.terraformBucket.id
  key    = "home.html"
  source = "./home.html"
  content_type = "text/html"
  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  #etag = filemd5("path/to/file")
}

resource "aws_s3_object" "css" {
  bucket = aws_s3_bucket.terraformBucket.id
  key    = "home.css"
  source = "./home.css"
  content_type = "text/css"
}

resource "aws_s3_object" "js" {
  bucket = aws_s3_bucket.terraformBucket.id
  key    = "home.js"
  source = "./home.js"
  content_type = "text/javascript"
}

resource "aws_s3_object" "diagramSVG" {
  bucket = aws_s3_bucket.terraformBucket.id
  key    = "CloudDiagram.svg"
  source = "./CloudDiagram.svg"
  content_type = "image/svg+xml"
}


resource "aws_s3_bucket_website_configuration" "terraformWebsite" {
  bucket = aws_s3_bucket.terraformBucket.id
  index_document {
    suffix = "home.html"
  }

# TODO
#   error_document {
#     key = "error.html"
#   }

  # routing_rule {
  #   condition {
  #     key_prefix_equals = "docs/"
  #   }
  #   redirect {
  #     replace_key_prefix_with = "documents/"
  #   }
  # }
}

resource "aws_s3_bucket_cors_configuration" "myCorsConfig" {
  bucket = aws_s3_bucket.terraformBucket.id

#   cors_rule {
#     allowed_headers = ["*"]
#     allowed_methods = ["PUT", "POST"]
#     allowed_origins = ["https://s3-website-test.hashicorp.com"]
#     expose_headers  = ["ETag"]
#     max_age_seconds = 3000
#   }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource "aws_cloudfront_distribution" "distribution" {
  enabled         = true
  is_ipv6_enabled = true

  origin {
    domain_name = aws_s3_bucket_website_configuration.terraformWebsite.website_endpoint
    origin_id   = aws_s3_bucket.terraformBucket.bucket_regional_domain_name

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 30
      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
  }


  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  default_cache_behavior {
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.terraformBucket.bucket_regional_domain_name
  }
}

output "s3_url" {
  description = "S3 hosting URL (HTTP)"
  value       = aws_s3_bucket_website_configuration.terraformWebsite.website_endpoint
}

output "website_url" {
  description = "Website URL (HTTPS)"
  value       = aws_cloudfront_distribution.distribution.domain_name
}