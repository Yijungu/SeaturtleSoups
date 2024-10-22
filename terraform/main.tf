terraform {
  required_version = ">= 1.0.0"
  backend "s3" {
    bucket = "my-terraform-state-bucket"
    key    = "turtle-app/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

module "vpc" {
  source = "./vpc"
}

module "database" {
  source = "./database"
}

module "ecs" {
  source = "./ecs"
}

module "secrets" {
  source = "./secrets"
}
