resource "aws_s3_bucket" "terraformBucket" {
  bucket = var.fullDomainName
  tags = {
    Name        = "terraformBucket"
    Environment = "Prod"
  }
}

#root bucket for redirection
resource "aws_s3_bucket" "rootBucket" {
  bucket = var.domainName
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
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = "home.html"
  source       = "../website/home.html"
  content_type = "text/html"

}

resource "aws_s3_object" "css" {
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = "home.css"
  source       = "../website/home.css"
  content_type = "text/css"
}

resource "aws_s3_object" "js" {
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = "home.js"
  source       = "../website/home.js"
  content_type = "text/javascript"
}



resource "aws_s3_object" "svg" {
  for_each     = fileset("website/", "*.svg")
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = each.value
  source       = "website/${each.value}"
  content_type = "image/svg+xml"
}


resource "aws_s3_bucket_website_configuration" "terraformWebsite" {
  bucket = aws_s3_bucket.terraformBucket.id
  index_document {
    suffix = "home.html"
  }

}

resource "aws_s3_bucket_cors_configuration" "myCorsConfig" {
  bucket = aws_s3_bucket.terraformBucket.id


  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}


#errors
resource "aws_s3_object" "htmlError" {
  for_each     = fileset("errors/", "*.html")
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = each.value
  source       = "errors/${each.value}"
  content_type = "text/html"
}

resource "aws_s3_object" "cssError" {
  for_each     = fileset("errors/", "*.css")
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = each.value
  source       = "errors/${each.value}"
  content_type = "text/css"
}

resource "aws_s3_object" "javascriptError" {
  for_each     = fileset("errors/", "*.js")
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = each.value
  source       = "errors/${each.value}"
  content_type = "text/javascript"
}

#bucket to pass api gateway url to javascript

resource "aws_s3_bucket" "jsonBucket" {
  bucket = "gregchow.jsonbucket"
  tags = {
    Name        = "terraformBucket"
    Environment = "Prod"
  }

}

#enable cors from www.gregchow.net
resource "aws_s3_bucket_cors_configuration" "jsonCors" {
  bucket = aws_s3_bucket.jsonBucket.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://www.gregchow.net"]
    expose_headers  = []
    max_age_seconds = 3000
  }
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://gregchow.net"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

#json bucket ownership
resource "aws_s3_bucket_ownership_controls" "jsonOwnership" {
  bucket = aws_s3_bucket.jsonBucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}
# allow bucket access
resource "aws_s3_bucket_public_access_block" "pbJson" {
  bucket = aws_s3_bucket.terraformBucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


resource "aws_s3_bucket_policy" "policyJson" {
  bucket = aws_s3_bucket.jsonBucket.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "PublicReadGetObject",
          "Effect" : "Allow",
          "Principal" : "*",
          "Action" : "s3:GetObject",
          "Resource" : "arn:aws:s3:::${aws_s3_bucket.jsonBucket.id}/*"
        }
      ]
    }
  )
}


# Render the template
data "template_file" "urlTemplate" {
  template = file("jsonFiles/links.tpl")
  vars = {
    urlCountVar  = "${aws_api_gateway_deployment.countDeployment.invoke_url}"
    urlTimeVar   = "${aws_api_gateway_deployment.timeDeployment.invoke_url}"
    urlStatusVar = "${aws_api_gateway_deployment.statusDeployment.invoke_url}"
    urlCacheVar = "${aws_api_gateway_deployment.cacheDeployment.invoke_url}"
  }
}

resource "aws_s3_object" "jsonCount" {
  bucket       = aws_s3_bucket.jsonBucket.id
  key          = "links.json"
  content      = data.template_file.urlTemplate.rendered #templatefile("jsonFiles/links.conf.tpl", local.template_vars)
  content_type = "application/json"
}
