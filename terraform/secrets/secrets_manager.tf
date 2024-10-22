resource "aws_secretsmanager_secret" "backend_secrets" {
  name = "turtle-backend-secrets"
}

resource "aws_secretsmanager_secret_version" "backend_secrets_version" {
  secret_id = aws_secretsmanager_secret.backend_secrets.id
  secret_string = jsonencode({
    OPENAI_API_KEY      = var.openai_api_key
    DATABASE_URL        = var.database_url
    JWT_SECRET          = var.jwt_secret
    NAVER_CLIENT_SECRET = var.naver_client_secret
  })
}
