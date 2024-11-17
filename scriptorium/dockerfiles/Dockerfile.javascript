# Dockerfile for Node.js (JavaScript)
# FROM node:latest
# WORKDIR /usr/src/app
# CMD ["node", "temp_code.js"]

FROM node:20
WORKDIR /usr/src/app
COPY . .
CMD ["node", "code.js"]