# 빌드 단계
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 프로덕션 단계
FROM node:18-alpine
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 프로덕션 의존성 설치
RUN npm ci --only=production

# 빌드 결과 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 환경 변수 설정
ENV NODE_ENV=production

# 포트 노출 및 시작 명령어
EXPOSE 3000
CMD ["npm", "start"]
