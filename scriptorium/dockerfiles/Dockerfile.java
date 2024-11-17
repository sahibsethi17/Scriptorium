# Dockerfile for Java
# FROM openjdk:latest
# WORKDIR /usr/src/app
# CMD ["java", "Main"]

FROM openjdk:20-slim
WORKDIR /usr/src/app
COPY . .
CMD ["java", "Main"]