FROM node:18-alpine AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

COPY . .
RUN  yarn install

EXPOSE 3000

CMD ["yarn", "start"]