# 使用官方 Node.js 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖
RUN npm install --production

# 暴露端口（必须是你的项目端口，一般 3000 / 8080）
EXPOSE 3000

# 启动项目
CMD ["npm", "start"]
