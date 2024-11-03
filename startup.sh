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

# GENERATED WITH CHATGPT: Create the admin user
node -e "(async () => { 
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcrypt');
    const prisma = new PrismaClient();
    try {
        const hashedPassword = await bcrypt.hash('adminPassword', 10);
        const user = await prisma.user.create({ 
            data: {
                email: 'admin@example.com',  
                username: 'admin',     
                password: hashedPassword,  
                firstName: 'Admin',      
                lastName: 'User',        
                phoneNumber: BigInt('1234567890'),  
                avatar: '@/scriptorium/public/uploads/avatars/man.png', 
                role: 'ADMIN'             
            },
        });
        console.log(user);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.\$disconnect();
    }
})()"

echo "Admin user created successfully."

echo "Setup complete."

cd ..