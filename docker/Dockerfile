FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash curl ca-certificates

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN mkdir -p reports/allure-results reports/screenshots reports/videos reports/coverage

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "-e", "const app = require('./tests/api/server'); app.listen(3000, () => console.log('Server on port 3000'));"]
