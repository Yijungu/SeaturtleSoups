variable "vpc_id" {}
variable "subnets" {
  type = list(string)
}
variable "db_password" {}
variable "openai_api_key" {}
variable "jwt_secret" {}
variable "naver_client_secret" {}
