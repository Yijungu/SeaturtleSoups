resource "aws_ecs_task_definition" "backend_task" {
  family = "turtle-backend-task"
  container_definitions = jsonencode([{
    name  = "turtle-backend"
    image = "<your-account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/turtle-backend:latest"
    portMappings = [{
      containerPort = 8080
    }]
    secrets = [{
      name      = "OPENAI_API_KEY"
      valueFrom = aws_secretsmanager_secret.backend_secrets.arn
    }]
  }])
}
