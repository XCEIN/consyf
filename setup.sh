#!/bin/bash
# Quick Start Script for Consyf Project
# Run this after XAMPP MySQL is started

set -e

echo "🚀 Consyf Quick Start"
echo "===================="

# Check MySQL
echo "📊 Checking MySQL connection..."
MYSQL_CMD=""
if mysql -uroot -S /opt/lampp/var/mysql/mysql.sock -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ MySQL (XAMPP) is running"
    MYSQL_CMD="mysql -uroot -S /opt/lampp/var/mysql/mysql.sock"
elif mysql -uroot -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ MySQL (System) is running"
    MYSQL_CMD="mysql -uroot"
else
    echo "❌ MySQL is not running!"
    echo "   Please start MySQL first:"
    echo "   - XAMPP: sudo /opt/lampp/lampp startmysql"
    echo "   - System: sudo systemctl start mysql"
    exit 1
fi

# Create database
echo "🗄️  Creating database..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS consyfnew;" 2>/dev/null
echo "✅ Database 'consyfnew' ready"

# Import schema
echo "📋 Importing schema..."
$MYSQL_CMD consyfnew < "$(dirname "$0")/backend/src/sql/schema.sql" 2>/dev/null
echo "✅ Schema imported"

# Check backend .env
if [ ! -f "$(dirname "$0")/backend/.env" ]; then
    echo "⚙️  Creating backend .env..."
    cp "$(dirname "$0")/backend/.env.example" "$(dirname "$0")/backend/.env"
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env exists"
fi

# Check frontend .env.local
if [ ! -f "$(dirname "$0")/front-end/.env.local" ]; then
    echo "⚙️  Creating frontend .env.local..."
    echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:4000" > "$(dirname "$0")/front-end/.env.local"
    echo "✅ Frontend .env.local created"
else
    echo "✅ Frontend .env.local exists"
fi

# Install dependencies
echo "📦 Checking dependencies..."
if [ ! -d "$(dirname "$0")/backend/node_modules" ]; then
    echo "   Installing backend dependencies..."
    (cd "$(dirname "$0")/backend" && npm install --silent)
fi
if [ ! -d "$(dirname "$0")/front-end/node_modules" ]; then
    echo "   Installing frontend dependencies..."
    (cd "$(dirname "$0")/front-end" && npm install --silent)
fi
echo "✅ All dependencies installed"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env if needed (JWT_SECRET, SMTP credentials)"
echo "   2. Run: ./start.sh"
echo "   3. Frontend: http://localhost:3000"
echo "   4. Backend:  http://localhost:4000"
echo ""
echo "🧪 Test the system:"
echo "   1. Register at http://localhost:3000/sign-up"
echo "   2. Check your email for OTP code"
echo "   3. Verify and login"
echo ""
