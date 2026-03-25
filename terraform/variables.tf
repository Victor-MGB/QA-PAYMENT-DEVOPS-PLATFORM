variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t2.micro"
}

variable "project_name" {
  description = "Project name"
  default     = "qa-devops-platform"
}

variable "environment" {
  description = "Environment name"
  default     = "dev"
}
