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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_header "Checking Prerequisites"

MISSING_DEPS=0

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is installed: $DOCKER_VERSION"
    
    # Check if Docker is running
    if docker info >/dev/null 2>&1; then
        print_success "Docker is running"
    else
        print_error "Docker is installed but not running. Please start Docker Desktop."
        MISSING_DEPS=1
    fi
else
    print_error "Docker is not installed"
    print_info "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    MISSING_DEPS=1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js is installed: $NODE_VERSION (>= 18 required)"
    else
        print_error "Node.js version is too old: $NODE_VERSION (>= 18 required)"
        print_info "Please update Node.js from: https://nodejs.org/"
        MISSING_DEPS=1
    fi
else
    print_error "Node.js is not installed"
    print_info "Please install Node.js 18+ from: https://nodejs.org/"
    MISSING_DEPS=1
fi

# Check .NET SDK
if command_exists dotnet; then
    DOTNET_VERSION=$(dotnet --version)
    DOTNET_MAJOR=$(echo $DOTNET_VERSION | cut -d'.' -f1)
    if [ "$DOTNET_MAJOR" -ge 8 ]; then
        print_success ".NET SDK is installed: $DOTNET_VERSION (>= 8.0 required)"
    else
        print_error ".NET SDK version is too old: $DOTNET_VERSION (>= 8.0 required)"
        print_info "Please update .NET SDK from: https://dotnet.microsoft.com/download/dotnet/8.0"
        MISSING_DEPS=1
    fi
else
    print_error ".NET SDK is not installed"
    print_info "Please install .NET 8.0 SDK from: https://dotnet.microsoft.com/download/dotnet/8.0"
    MISSING_DEPS=1
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    PNPM_MAJOR=$(echo $PNPM_VERSION | cut -d'.' -f1)
    if [ "$PNPM_MAJOR" -ge 8 ]; then
        print_success "pnpm is installed: $PNPM_VERSION (>= 8.0 required)"
    else
        print_warning "pnpm version might be too old: $PNPM_VERSION (>= 8.0 recommended)"
        read -p "Do you want to update pnpm? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm install -g pnpm@latest
            print_success "pnpm updated"
        fi
    fi
else
    print_warning "pnpm is not installed"
    print_info "Installing pnpm globally..."
    npm install -g pnpm@latest
    if command_exists pnpm; then
        print_success "pnpm installed successfully"
    else
        print_error "Failed to install pnpm"
        MISSING_DEPS=1
    fi
fi

# Exit if dependencies are missing
if [ $MISSING_DEPS -eq 1 ]; then
    print_error "\nPlease install the missing dependencies and run this script again."
    exit 1
fi

print_success "All prerequisites are met!\n"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Install frontend dependencies
print_header "Installing Frontend Dependencies"
cd web
if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages (this may take a minute)..."
    pnpm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
else
    print_success "Frontend dependencies already installed"
fi
cd "$PROJECT_ROOT"

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

# Run migrations
print_header "Running Database Migrations"
print_info "Applying migrations..."
dotnet ef database update

if [ $? -eq 0 ]; then
    print_success "Database migrations applied"
else
    print_error "Failed to apply migrations"
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

