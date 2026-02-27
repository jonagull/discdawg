#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Show notice about first-time setup
print_header "Starting Services"
print_warning "This script is for RUNNING the project."
print_info "If this is your first time, please run ./setup.sh instead to install dependencies and set up the database.\n"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if node_modules exists (basic check for setup)
if [ ! -d "web/node_modules" ]; then
    print_error "Frontend dependencies not found. Please run ./setup.sh first."
    exit 1
fi

# Start database
print_header "Starting Database"
cd BackendApi
print_info "Starting PostgreSQL container..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_success "Database container started"
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    MAX_ATTEMPTS=30
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if docker exec db_postgres pg_isready -U backendapi_user >/dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 1
    done
    echo
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_error "Database failed to start in time"
        exit 1
    fi
else
    print_error "Failed to start database container"
    exit 1
fi

cd "$PROJECT_ROOT"

# Start services
print_header "Starting Services"
print_info "Starting backend and frontend..."
print_info "Backend will run at: http://localhost:5157"
print_info "Frontend will run at: http://localhost:3000"
print_info "Swagger UI: http://localhost:5157/swagger"
print_info "\nPress Ctrl+C to stop all services\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd BackendApi
dotnet run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Start frontend in background
cd web
pnpm dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

# Wait a moment for services to start
sleep 3

# Check if services are running
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend started (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start. Check /tmp/backend.log for details"
    exit 1
fi

if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend started (PID: $FRONTEND_PID)"
else
    print_error "Frontend failed to start. Check /tmp/frontend.log for details"
    exit 1
fi

print_success "\nEverything is running! 🚀"
print_info "Logs are being written to /tmp/backend.log and /tmp/frontend.log"
print_info "You can view logs with: tail -f /tmp/backend.log or tail -f /tmp/frontend.log\n"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

