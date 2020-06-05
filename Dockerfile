#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:lts AS builder

WORKDIR /usr/sentry

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./sentry ./sentry

RUN npm ci --quiet && npm run build

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:lts-alpine

EXPOSE 8080

WORKDIR /sentry
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production
RUN npm i -g pm2

## We just need the build to execute the command
COPY --from=builder /usr/sentry/build ./build

CMD ["pm2-runtime", "build/index.js"]
