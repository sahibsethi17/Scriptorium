FROM gcc:latest
WORKDIR /usr/src/app
COPY . .
RUN gcc code.c -o code
CMD ["./code"]


# # Dockerfile for C
# FROM gcc:latest
# WORKDIR /usr/src/app
# RUN gcc -o a.out temp_code.c
# CMD ["./a.out"]