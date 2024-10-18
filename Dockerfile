# Step 1: Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies (this will use the package.json files to install all required dependencies)
RUN npm install

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Build the Next.js project
RUN npm run build

# Step 7: Expose the port that the app will run on (3000 for Next.js)
EXPOSE 3000

# Step 8: Start the Next.js application
CMD ["npm", "start"]
