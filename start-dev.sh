#!/bin/bash

# Kill any existing node processes that might be running on port 3001
echo "Stopping any existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "wallet-persona-frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd wallet-persona-frontend
  npm install
  cd ..
fi

# Start backend server in the background
echo "Starting backend server..."
npm run dev:backend &
BACKEND_PID=$!

# Give the backend server a moment to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd wallet-persona-frontend
npm start

# Kill the backend server when the script exits
trap "kill $BACKEND_PID" EXIT 
 