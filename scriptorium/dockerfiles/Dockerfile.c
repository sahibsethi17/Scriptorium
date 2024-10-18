FROM gcc:latest
WORKDIR /usr/src/app
COPY . .
RUN gcc code.c -o code
CMD ["./code"]
