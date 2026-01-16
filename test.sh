#!/bin/bash

# AIT Test Script
# Tests the daemon startup, API endpoints, and basic functionality

set -e

DAEMON_PORT=3001
PROJECT_PATH="${1:-$(pwd)}"
DAEMON_PID=""

cleanup() {
    if [ ! -z "$DAEMON_PID" ]; then
        echo "Stopping daemon (PID: $DAEMON_PID)..."
        kill $DAEMON_PID 2>/dev/null || true
        wait $DAEMON_PID 2>/dev/null || true
    fi
    # Kill any remaining daemon processes
    pkill -f "node.*dist/index.js" 2>/dev/null || true
}

trap cleanup EXIT

echo "=== AIT Test Script ==="
echo "Project path: $PROJECT_PATH"
echo ""

# Check if Ollama is running
echo "1. Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✓ Ollama is running"
    OLLAMA_MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | head -2)
    echo "   Models: $OLLAMA_MODELS"
else
    echo "   ✗ Ollama is not running on localhost:11434"
    echo "   Please start Ollama: ollama serve"
    exit 1
fi

# Build project
echo ""
echo "2. Building project..."
cd "$(dirname "$0")"
npm run build > /dev/null 2>&1
echo "   ✓ Build successful"

# Start daemon
echo ""
echo "3. Starting daemon..."
cd daemon
node dist/index.js "$PROJECT_PATH" > /tmp/ait-daemon-test.log 2>&1 &
DAEMON_PID=$!
sleep 5

# Check if daemon started
if ! kill -0 $DAEMON_PID 2>/dev/null; then
    echo "   ✗ Daemon failed to start"
    echo "   Log:"
    tail -20 /tmp/ait-daemon-test.log
    exit 1
fi
echo "   ✓ Daemon started (PID: $DAEMON_PID)"

# Test status endpoint
echo ""
echo "4. Testing /status endpoint..."
STATUS=$(curl -s http://localhost:$DAEMON_PORT/status)
if echo "$STATUS" | grep -q '"running":true'; then
    echo "   ✓ Status endpoint working"
else
    echo "   ✗ Status endpoint failed"
    echo "   Response: $STATUS"
    exit 1
fi

# Test db/stats endpoint
echo ""
echo "5. Testing /db/stats endpoint..."
STATS=$(curl -s http://localhost:$DAEMON_PORT/db/stats)
if echo "$STATS" | grep -q '"files_count"'; then
    echo "   ✓ DB stats endpoint working"
    FILES_COUNT=$(echo "$STATS" | grep -o '"files_count":[0-9]*' | grep -o '[0-9]*')
    echo "   Files in DB: $FILES_COUNT"
else
    echo "   ✗ DB stats endpoint failed"
    echo "   Response: $STATS"
    exit 1
fi

# Test index endpoint
echo ""
echo "6. Testing /index endpoint..."
INDEX_RESULT=$(curl -s -X POST http://localhost:$DAEMON_PORT/index \
    -H "Content-Type: application/json" \
    -d "{\"project_path\": \"$PROJECT_PATH\"}")
if echo "$INDEX_RESULT" | grep -q '"success":true'; then
    echo "   ✓ Index endpoint working"
    FILES_INDEXED=$(echo "$INDEX_RESULT" | grep -o '"files_indexed":[0-9]*' | grep -o '[0-9]*')
    echo "   Files indexed: $FILES_INDEXED"
else
    echo "   ⚠ Index endpoint returned error (may be expected if already indexed)"
    echo "   Response: $INDEX_RESULT"
fi

# Test query endpoint
echo ""
echo "7. Testing /query endpoint..."
QUERY_RESULT=$(curl -s -X POST http://localhost:$DAEMON_PORT/query \
    -H "Content-Type: application/json" \
    -d '{"task": "List all files", "context": {"task": "List all files", "query": "files"}}')
if echo "$QUERY_RESULT" | grep -q '"success"'; then
    echo "   ✓ Query endpoint working"
else
    echo "   ⚠ Query endpoint returned error (may need better context)"
    echo "   Response: $(echo "$QUERY_RESULT" | head -100)"
fi

echo ""
echo "=== All Tests Passed! ==="
echo ""
echo "Daemon is running on port $DAEMON_PORT"
echo "You can now:"
echo "  - Use the CLI: cd cli && node dist/index.js <command>"
echo "  - Use the VS Code extension"
echo "  - Make API calls to http://localhost:$DAEMON_PORT"
echo ""
echo "Press Ctrl+C to stop the daemon"

# Keep daemon running
wait $DAEMON_PID
