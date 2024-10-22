# VPC 설정
vpc_id            = "vpc-044aed6af5f33c4a4"  # VPC ID
subnets           = ["subnet-079c80fc34fa975f4", "subnet-03cdf2ab83f2d27d2", "subnet-088eab0808f307e96", "subnet-09e3b6e52bfe95477"]  # 서브넷 ID들

# 보안 그룹 설정
security_groups = [
  "sg-05c44568f25d28760",  # 백엔드 보안 그룹
  "sg-008973230ff888b8f",  # 프론트엔드 보안 그룹
  "sg-011571bd180486bb6"   # 데이터베이스 보안 그룹
]


# Database 설정
db_password       = "244589zz!!"  # RDS 비밀번호
db_username       = "turtle"  # RDS 사용자 이름
db_name           = "turtle"  # 데이터베이스 이름
db_instance_class = "db.t3.micro"  # RDS 인스턴스 타입

# AWS Secrets Manager 설정 (시크릿 ARN)
openai_secret_arn = "arn:aws:secretsmanager:ap-northeast-2:010438505844:secret:turtle-backend-secrets-QlGRZU"

# ECS 설정
ecs_cluster_name     = "turtle-backend-cluster"  # 백엔드 ECS 클러스터 이름
frontend_cluster_name = "turtle-frontend-cluster"  # 프론트엔드 ECS 클러스터 이름
task_cpu              = "256"  # ECS 태스크 CPU
task_memory           = "512"  # ECS 태스크 메모리

# 네이버 API 설정
naver_client_id     = "YJapoM9m6N8i3Tnk6gmn"  # 네이버 클라이언트 ID
naver_client_secret = "NKmaZhueS_"  # 네이버 클라이언트 시크릿
naver_redirect_uri  = "https://seaturtlesoups.com/admin/login"  # 리디렉션 URI

# 네트워크 설정
assign_public_ip = true  # 퍼블릭 IP 할당 여부 (Fargate 등)

# 로드밸런서 설정
target_group_arn = "arn:aws:elasticloadbalancing:region:account-id:targetgroup/backend-tg/123456789"

# JWT 설정
jwt_secret = "APruKtERj9Cw-IlU9q1AvwDjcrc98q2T9Mb1wK4"

# 환경 변수 설정
NEXT_PUBLIC_API_URL = "https://seaturtlesoups.com"  # 백엔드 API 주소
