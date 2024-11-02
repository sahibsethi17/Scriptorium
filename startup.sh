cd scriptorium

# install all required packages via npm
npm install

# run all migrations
npx prisma migrate dev --name init

# check that the required compilers/interpreters are already installed

# create admin user

cd ..