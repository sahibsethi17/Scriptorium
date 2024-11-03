#!/bin/bash

cd scriptorium

# Install all required packages via npm
npm install
npm install formidable
npm install path

# Run all migrations
npx prisma migrate dev --name init

# Check that the required compilers/interpreters are already installed
echo "Checking for required compilers and interpreters..."
if ! command -v gcc &> /dev/null; then
    echo "GCC is not installed. Please install GCC to run C code."
fi

if ! command -v g++ &> /dev/null; then
    echo "G++ is not installed. Please install G++ to run C++ code."
fi

if ! command -v javac &> /dev/null; then
    echo "Java Compiler is not installed. Please install Java to run Java code."
fi

if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python to run Python code."
fi

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run JavaScript code."
fi


echo "Starting the server..."
npm run dev & 
SERVER_PID=$!


echo "Waiting for server to start..."
sleep 2

echo "Creating admin user..."
curl -X POST http://localhost:3000/api/users/signup \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@example.com",
  "password": "adminPassword",
  "username": "admin",
  "role": "ADMIN",
  "firstName": "Admin",
  "lastName": "User",
  "phoneNumber": 1234567890
}'
echo "Admin user created successfully."


echo "Stopping the server..."
kill $SERVER_PID

echo "Setup complete."