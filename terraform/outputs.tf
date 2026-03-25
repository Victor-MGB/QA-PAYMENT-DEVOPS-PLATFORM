output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.qa_runner.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.qa_runner.public_dns
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.qa_sg.id
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.qa_runner.id
}
