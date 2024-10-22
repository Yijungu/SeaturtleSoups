resource "aws_db_instance" "turtle_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "13.3"
  instance_class       = "db.t3.micro"
  name                 = "turtle_backend"
  username             = "turtle_user"
  password             = var.db_password
  publicly_accessible  = false
  vpc_security_group_ids = [module.vpc.security_group_id]
}
