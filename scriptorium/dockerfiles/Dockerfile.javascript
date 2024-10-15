FROM node:20
WORKDIR /usr/src/app
COPY . .
CMD ["node", "code.js"]