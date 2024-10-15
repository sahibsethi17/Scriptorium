FROM openjdk:20-slim
WORKDIR /usr/src/app
COPY . .
CMD ["java", "Main"]