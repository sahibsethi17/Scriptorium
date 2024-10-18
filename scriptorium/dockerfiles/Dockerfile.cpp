FROM gcc:latest
WORKDIR /usr/src/app
COPY code.cpp . 
RUN g++ code.cpp -o code
CMD ["./code"]