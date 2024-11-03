cd scriptorium

# install all required packages via npm
npm install

# run all migrations
npx prisma migrate dev --name init

# check that the required compilers/interpreters are already installed
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
    echo "Python3 is not installed. Please install Python3 to run Python code."
fi

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run JavaScript code."
fi
# create admin user

cd ..