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
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = "home.html"
  source       = "../website/home.html"
  content_type = "text/html"
  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  #etag = filemd5("path/to/file")
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

resource "aws_s3_object" "diagramSVG" {
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = "CloudDiagram.svg"
  source       = "../website/CloudDiagram.svg"
  content_type = "image/svg+xml"
}


resource "aws_s3_object" "diagramSVG" {
  bucket       = aws_s3_bucket.terraformBucket.id
  key          = "proxmox.svg"
  source       = "../website/proxmox.svg"
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
