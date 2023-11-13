provider "aws"{
    region = "us-east-1"
}

resource "aws_s3_bucket" "terraformBucket" {
  bucket = "www.gregchow.net"
  #acl = ""
  tags = {
    Name        = "terraformBucket"
    Environment = "Prod"
  }
}

#root bucket for redirection
resource "aws_s3_bucket" "rootBucket" {
  bucket = "gregchow.net"
  #acl = ""
  tags = {
    Name        = "terraformBucket"
    Environment = "Prod"
  }
}

#root bucket website redirect
resource "aws_s3_bucket_website_configuration" "rootWebsite" {
  bucket = aws_s3_bucket.rootBucket.id
  redirect_all_requests_to {
    host_name = aws_s3_bucket_website_configuration.terraformWebsite.website_endpoint
    #protocol = http
  }
}


#root bucket cloudfront
resource "aws_cloudfront_distribution" "rootDistribution" {
  enabled         = true
  is_ipv6_enabled = true

  origin {
    domain_name = aws_s3_bucket_website_configuration.rootWebsite.website_endpoint
    origin_id   = aws_s3_bucket.rootBucket.bucket_regional_domain_name

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
    target_origin_id       = aws_s3_bucket.rootBucket.bucket_regional_domain_name
  }
}

#main bucket ownership
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

    aliases = ["www.gregchow.net", "gregchow.net"]

  viewer_certificate {
    acm_certificate_arn  = aws_acm_certificate_validation.certValidation.certificate_arn#aws_acm_certificate.cert.arn
    ssl_support_method = "vip"
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
  depends_on = [
    
    ]
}

variable "domainName" {
  default = "gregchow.net"
}

#already created, terraform just manages it
resource "aws_route53_zone" "hostedZone" {
  name = var.domainName
}

resource "aws_acm_certificate" "cert" {
  domain_name               = var.domainName
  #provider                  = aws.acm
  subject_alternative_names = ["www.gregchow.net"]
  validation_method         = "DNS"
  tags = {
    Name : var.domainName
  }

  lifecycle {
    create_before_destroy = true
  }
}

#dns record to validate cert

# resource "aws_route53_record" "certRecord" {
#   zone_id = aws_route53_zone.hostedZone.zone_id
#   name    = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_name
#   type    = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_type
#   records = [tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_value]
#   ttl     = 60
# }

# data "aws_route53_zone" "cert" {
#   #name         = "gregchow.net"
#   zone_id = 
#   private_zone = false
# }

resource "aws_route53_record" "certRecord" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
      zone_id = aws_route53_zone.hostedZone.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id

  # records = [
  #   "${aws_route53_zone.hostedZone.name_servers.0}",
  #   "${aws_route53_zone.hostedZone.name_servers.1}",
  #   "${aws_route53_zone.hostedZone.name_servers.2}",
  #   "${aws_route53_zone.hostedZone.name_servers.3}",
  # ]
}

resource "aws_acm_certificate_validation" "certValidation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.certRecord : record.fqdn]
}
# ##needed to validate cert
# data "aws_route53_zone" "external" {
#   name = "gregchow.net"
# }

# resource "aws_route53_record" "validation" {
#   name    = aws_acm_certificate.cert.domain_name
#   type    = aws_acm_certificate.cert.resource_record_type
#   zone_id = "${data.aws_route53_zone.external.zone_id}"
#   records = [aws_acm_certificate.cert.resource_record_value]
#   ttl     = "60"
# }

#www  cert
resource "aws_route53_record" "record" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "www.gregchow.net"
  type    = "A"
  alias {
    name = "${aws_cloudfront_distribution.distribution.domain_name}"
    zone_id = "${aws_cloudfront_distribution.distribution.hosted_zone_id}"
    evaluate_target_health = true
  }
}

#root cert
resource "aws_route53_record" "rootRecord" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "gregchow.net"
  type   = "A"
    alias {
    name = "${aws_cloudfront_distribution.rootDistribution.domain_name}"
    zone_id = "${aws_cloudfront_distribution.rootDistribution.hosted_zone_id}"
    evaluate_target_health = true
  }
 }

#  resource "aws_route53_record" "record6" {
#   zone_id = aws_route53_zone.hostedZone.zone_id
#   name    = "www.gregchow.net"
#   type    = "AAAA"
#   alias {
#     name = aws_cloudfront_distribution.distribution.domain_name
#     zone_id = aws_cloudfront_distribution.distribution.hosted_zone_id
#     evaluate_target_health = true
#   }
# }

#  resource "aws_route53_record" "rootRecord6" {
#   zone_id = aws_route53_zone.hostedZone.zone_id
#   name    = "gregchow.net"
#   type   = "AAAA"
#     alias {
#     name = aws_cloudfront_distribution.rootDistribution.domain_name
#     zone_id = aws_cloudfront_distribution.rootDistribution.hosted_zone_id
#     evaluate_target_health = true
#   }
#  }



#  #validate cert
#  resource "aws_acm_certificate_validation" "certValidation" {
#    certificate_arn         = aws_acm_certificate.cert.arn
#    validation_record_fqdns = [aws_route53_record.record.fqdn]
#  }

# change and manually make it point to cloud front distribution (like before)

# resource "aws_route53_record" "record" {
#   count = 2 #number of alternative names + 1


#
#   zone_id = aws_route53_zone.hostedZone.zone_id
#   name    = element(aws_acm_certificate.cert.domain_validation_options.*.resource_record_name, count.index)
#   type    = element(aws_acm_certificate.cert.domain_validation_options.*.resource_record_type, count.index)
#   records = [element(aws_acm_certificate.cert.domain_validation_options.*.resource_record_value, count.index)]
#   ttl     = 60
# }

#  resource "aws_acm_certificate_validation" "certValidation" {

#   certificate_arn         = aws_acm_certificate.cert.arn
#   validation_record_fqdns = aws_route53_record.record.*.fqdn
#   timeouts {
# +    create = "60m"
# +  }
#  }



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