#!/bin/bash

# Gestion Emballages Setup Script
# This script helps set up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    local missing_deps=()
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Function to setup environment file
setup_env() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please review and update the .env file with your configuration"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping..."
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
}

# Function to setup Docker network
setup_docker_network() {
    print_status "Setting up Docker network..."
    
    if ! docker network ls | grep -q "gestion-emballages-network"; then
        docker network create gestion-emballages-network
        print_success "Docker network created"
    else
        print_warning "Docker network already exists"
    fi
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
    else
        docker-compose build
    fi
    
    print_success "Docker images built successfully"
}

# Function to initialize database
init_database() {
    print_status "Initializing database..."
    
    # Start only PostgreSQL for initialization
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Run migrations (if using TypeORM CLI)
    if [ -d "backend" ]; then
        cd backend
        if npm list @nestjs/typeorm >/dev/null 2>&1; then
            print_status "Running database migrations..."
            npm run migration:run 2>/dev/null || print_warning "No migrations to run or migration command not available"
        fi
        cd ..
    fi
    
    print_success "Database initialized"
}

# Function to start services
start_services() {
    local env="$1"
    print_status "Starting services in $env mode..."
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    elif [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    print_success "Services started successfully"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose ps
    
    print_status "Available services:"
    echo "- Frontend: http://localhost (or configured port)"
    echo "- Backend API: http://localhost:3000/api"
    echo "- API Documentation: http://localhost:3000/api-docs"
    echo "- Database (Adminer): http://localhost:8080"
    echo "- MinIO Console: http://localhost:9001"
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."
    
    local services=("backend" "postgres" "redis" "minio")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -ne 0 ]; then
        print_error "Failed services: ${failed_services[*]}"
        return 1
    fi
    
    print_success "All services are healthy"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    docker-compose down
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Function to show logs
show_logs() {
    local service="$1"
    
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to backup database
backup_db() {
    print_status "Creating database backup..."
    
    local backup_name="backup_$(date +%Y%m%d_%H%M%S).sql"
    local backup_dir="./backups"
    
    mkdir -p "$backup_dir"
    
    docker-compose exec postgres pg_dump -U postgres gestion_emballages > "$backup_dir/$backup_name"
    
    print_success "Database backup created: $backup_dir/$backup_name"
}

# Function to restore database
restore_db() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file path"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Restoring database from: $backup_file"
    
    docker-compose exec -T postgres psql -U postgres gestion_emballages < "$backup_file"
    
    print_success "Database restored successfully"
}

# Function to show help
show_help() {
    cat << EOF
Gestion Emballages Setup Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    setup [dev|prod]     - Complete setup (default: dev)
    install              - Install dependencies only
    build [dev|prod]     - Build Docker images
    start [dev|prod]     - Start services
    stop                 - Stop services
    restart [dev|prod]   - Restart services
    status               - Show service status
    logs [service]       - Show logs (optionally for specific service)
    health               - Run health checks
    backup               - Backup database
    restore <file>       - Restore database from backup
    clean                - Clean up containers and images
    help                 - Show this help message

Examples:
    $0 setup dev         - Set up development environment
    $0 setup prod        - Set up production environment
    $0 logs backend      - Show backend service logs
    $0 backup            - Create database backup
    $0 restore backup.sql - Restore from backup file

EOF
}

# Main script execution
main() {
    local command="$1"
    local option="$2"
    
    case "$command" in
        setup)
            local env="${option:-dev}"
            check_requirements
            setup_env
            install_dependencies
            setup_docker_network
            build_images "$env"
            init_database
            start_services "$env"
            sleep 5
            health_check
            show_status
            ;;
        install)
            install_dependencies
            ;;
        build)
            local env="${option:-dev}"
            build_images "$env"
            ;;
        start)
            local env="${option:-dev}"
            start_services "$env"
            ;;
        stop)
            print_status "Stopping services..."
            docker-compose down
            print_success "Services stopped"
            ;;
        restart)
            local env="${option:-dev}"
            print_status "Restarting services..."
            docker-compose down
            start_services "$env"
            print_success "Services restarted"
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$option"
            ;;
        health)
            health_check
            ;;
        backup)
            backup_db
            ;;
        restore)
            restore_db "$option"
            ;;
        clean)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root is not recommended"
fi

# Run main function with all arguments
main "$@"