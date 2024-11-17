# Dockerfile for C++
# FROM gcc:latest
# WORKDIR /usr/src/app
# RUN g++ -o a.out temp_code.cpp
# CMD ["./a.out"]

FROM gcc:latest
WORKDIR /usr/src/app
COPY code.cpp . 
RUN g++ code.cpp -o code
CMD ["./code"]