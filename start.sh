#!/bin/bash
echo "Starting Realm of Ascension..."

cd "$(dirname "$0")"

cd backend && node src/index.js &
BACKEND_PID=$!
cd ..

echo "Backend started (PID $BACKEND_PID)"

cd frontend && npx ng serve --port 4200 &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT TERM
wait
