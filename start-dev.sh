#!/bin/bash

# Install dependencies if node_modules doesn't exist
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

# Start both servers in development mode
echo "Starting development servers..."
npm run dev 
 