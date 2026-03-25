terraform {
  backend "s3" {
    bucket         = ""
    key            = "qa-devops/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "qa-devops-tf-lock"
    encrypt        = true
  }
}
