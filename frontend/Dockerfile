# 生產環境 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 複製依賴檔案
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製原始碼
COPY . .

# 構建應用
RUN npm run build

# 生產環境使用 Nginx
FROM nginx:alpine

# 複製構建結果
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 Nginx 配置
COPY nginx.prod.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


