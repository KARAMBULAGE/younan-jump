FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
COPY package.json package-lock.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
USER appuser
EXPOSE 3001
CMD ["sh", "-c", "npm run start -- -p 3001"]
