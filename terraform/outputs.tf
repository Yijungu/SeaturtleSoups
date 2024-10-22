output "vpc_id" {
  value = module.vpc.vpc_id
}

output "subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "ecs_cluster_id" {
  value = module.ecs.cluster_id
}
