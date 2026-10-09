# Aicardly backend on AWS App Runner (Mumbai, ap-south-1). Built by AWS CodeBuild from
# deploy/aws/buildspec.yml — see deploy/aws/README.md. Logs go to stdout → CloudWatch Logs.
FROM public.ecr.aws/docker/library/node:22-alpine

ENV NODE_ENV=production PORT=8080
WORKDIR /app

# Dependencies first, so a code-only change reuses this layer.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY . .

# Run as the image's non-root user.
RUN chown -R node:node /app
USER node

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server.js"]
