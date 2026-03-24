#!/bin/bash
# Bash script to start FastAPI backend with Ngrok
# Usage: ./start-ngrok.sh

echo "========================================"
echo "  TomatoGuard - Ngrok Startup Script"
echo "========================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok not found!"
    echo "Please install Ngrok:"
    echo "  brew install ngrok/ngrok/ngrok"
    echo "Or download from https://ngrok.com/download"
    exit 1
fi

echo "✅ Ngrok found: $(which ngrok)"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    echo "Please run this script from the TomatoGuard root directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Checking dependencies..."
cd backend
pip install -q -r requirements.txt
cd ..

echo ""
echo "🚀 Starting FastAPI backend on port 8000..."
echo "   (This will run in the background)"
echo ""

# Start FastAPI in background
cd backend
source ../venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for server to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend is running! (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend might still be starting..."
    echo "   Check backend.log for details"
fi

echo ""
echo "🌐 Starting Ngrok tunnel..."
echo ""
echo "📋 IMPORTANT: Copy the HTTPS URL from Ngrok output below"
echo "   Then update TomatoGuardExpo/.env with:"
echo "   EXPO_PUBLIC_API_URL=https://YOUR_NGROK_URL.ngrok-free.app"
echo ""
echo "Press Ctrl+C to stop Ngrok and backend"
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Start Ngrok
ngrok http 8000
