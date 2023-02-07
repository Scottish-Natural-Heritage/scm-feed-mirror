# Tell terraform where to keep it's state between runs so it can be run
# locally as well as on ci/cd
terraform {
  backend "s3" {
    bucket = "naturescot-scm-feed-mirror-state"
    key    = "terraform-state"
    region = "eu-west-2"
  }
}

provider "aws" {
  region = "eu-west-2"
}

# Create an S3 bucket for storing our files
resource "aws_s3_bucket" "bucket" {
  bucket = "naturescot-scm-feed-mirror"
}

# Configure the web serving from S3
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.bucket.bucket

  index_document {
    suffix = "index.json"
  }
}

# Allow GET requests from anywhere
resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.bucket.bucket

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}
