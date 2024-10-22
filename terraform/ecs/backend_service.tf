resource "aws_ecs_service" "backend_service" {
  cluster         = aws_ecs_cluster.turtle_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = 2
}
