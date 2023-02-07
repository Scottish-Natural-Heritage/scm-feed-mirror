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
