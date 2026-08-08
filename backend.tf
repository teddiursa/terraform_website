/*
  Remote state, so this project can be applied from any machine instead of
  only the one holding terraform.tfstate.

  The backend's own bucket and lock table cannot be created by the config that
  stores its state in them, so they are bootstrapped once by hand:

    aws s3api create-bucket \
      --bucket gregchow.tfstate --region us-east-1

    aws s3api put-bucket-versioning \
      --bucket gregchow.tfstate \
      --versioning-configuration Status=Enabled

    aws s3api put-bucket-encryption \
      --bucket gregchow.tfstate \
      --server-side-encryption-configuration \
        '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

    aws s3api put-public-access-block \
      --bucket gregchow.tfstate \
      --public-access-block-configuration \
        'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

    aws dynamodb create-table \
      --table-name terraform-locks \
      --attribute-definitions AttributeName=LockID,AttributeType=S \
      --key-schema AttributeName=LockID,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --region us-east-1

  Then copy terraform.tfstate over from the old machine and migrate:

    terraform init -migrate-state

  Versioning is on so a corrupted or truncated state can be rolled back, and
  the lock table stops two machines applying at once.
*/

terraform {
  required_version = ">= 1.3"

  backend "s3" {
    bucket         = "gregchow.tfstate"
    key            = "terraform_website/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.55"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}
