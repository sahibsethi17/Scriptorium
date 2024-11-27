#!/bin/bash

cd scriptorium

# Install all required packages via npm
npm install


# Run all migrations
npx prisma migrate dev --name init

docker pull python:3.10 
docker pull node:18 
docker pull gcc:latest 
docker pull openjdk:17 
docker pull php:8.0-cli
docker pull ruby:3.0
docker pull golang:1.16
docker pull swift:5.8
docker pull rust:latest

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