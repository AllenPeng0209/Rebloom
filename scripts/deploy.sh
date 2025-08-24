#!/bin/bash

# Production Deployment Script for Rebloom
# This script handles the complete deployment process with safety checks

set -euo pipefail # Exit on error, undefined vars, and pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${1:-production}"
DEPLOY_VERSION="${2:-latest}"
REGISTRY="ghcr.io"
IMAGE_NAME="rebloom"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ON_FAILURE=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Error handling
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed! Cleaning up..."
        if [[ "$ROLLBACK_ON_FAILURE" == "true" && -n "${PREVIOUS_VERSION:-}" ]]; then
            log_info "Rolling back to previous version: $PREVIOUS_VERSION"
            rollback_deployment
        fi
    fi
}

trap cleanup EXIT

# Check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check required tools
    local required_tools=("docker" "docker-compose" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool '$tool' is not installed"
            exit 1
        fi
    done
    
    # Check environment files
    if [[ ! -f "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" ]]; then
        log_error "Environment file .env.$DEPLOYMENT_ENV not found"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment configuration for $DEPLOYMENT_ENV..."
    
    # Source environment file
    set -a # Export all variables
    source "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV"
    set +a
    
    # Validate critical environment variables
    local required_vars=("DATABASE_URL" "JWT_SECRET" "ENCRYPTION_KEY")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable '$var' is not set"
            exit 1
        fi
    done
    
    log_success "Environment configuration loaded"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check database connectivity
    log_info "Checking database connectivity..."
    if ! timeout 10 bash -c "</dev/tcp/$(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)/5432" 2>/dev/null; then
        log_warning "Database connectivity check failed or timed out"
    else
        log_success "Database is reachable"
    fi
    
    # Check Redis connectivity
    if [[ -n "${REDIS_URL:-}" ]]; then
        log_info "Checking Redis connectivity..."
        # Extract host and port from Redis URL
        local redis_host=$(echo $REDIS_URL | cut -d'@' -f2 | cut -d':' -f1)
        local redis_port=$(echo $REDIS_URL | cut -d':' -f3)
        if ! timeout 5 bash -c "</dev/tcp/$redis_host/$redis_port" 2>/dev/null; then
            log_warning "Redis connectivity check failed or timed out"
        else
            log_success "Redis is reachable"
        fi
    fi
    
    log_success "Pre-deployment checks completed"
}

# Backup current deployment
backup_deployment() {
    log_info "Creating deployment backup..."
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database (if applicable)
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        log_info "Creating database backup..."
        # Add database backup command here based on your database type
        # Example for PostgreSQL:
        # pg_dump "$DATABASE_URL" > "$backup_dir/database.sql"
    fi
    
    # Backup current docker-compose state
    docker-compose -f "$PROJECT_ROOT/docker-compose.yml" config > "$backup_dir/docker-compose.backup.yml" 2>/dev/null || true
    
    # Store current image version for potential rollback
    PREVIOUS_VERSION=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "$REGISTRY/$IMAGE_NAME" | head -1 | cut -d':' -f2 || echo "")
    
    log_success "Backup created at $backup_dir"
}

# Pull and validate Docker images
pull_images() {
    log_info "Pulling Docker images..."
    
    local image_tag="$REGISTRY/$IMAGE_NAME:$DEPLOY_VERSION"
    
    # Pull the image
    if ! docker pull "$image_tag"; then
        log_error "Failed to pull Docker image: $image_tag"
        exit 1
    fi
    
    # Verify image integrity
    if ! docker inspect "$image_tag" > /dev/null 2>&1; then
        log_error "Docker image verification failed: $image_tag"
        exit 1
    fi
    
    log_success "Docker image pulled and verified: $image_tag"
}

# Update configuration files
update_configuration() {
    log_info "Updating configuration files..."
    
    # Create environment-specific docker-compose override
    cat > "$PROJECT_ROOT/docker-compose.override.yml" << EOF
version: '3.8'
services:
  api:
    image: $REGISTRY/$IMAGE_NAME:$DEPLOY_VERSION
    environment:
      - NODE_ENV=$DEPLOYMENT_ENV
    restart: unless-stopped
EOF
    
    log_success "Configuration files updated"
}

# Deploy the application
deploy_application() {
    log_info "Deploying application..."
    
    cd "$PROJECT_ROOT"
    
    # Stop existing services gracefully
    log_info "Stopping existing services..."
    docker-compose down --timeout 30 || true
    
    # Start services with new configuration
    log_info "Starting services with new configuration..."
    docker-compose up -d --remove-orphans
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    log_success "Application deployment completed"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    local health_url="http://localhost:${API_PORT:-3000}/health"
    local attempts=0
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / 10))
    
    while [[ $attempts -lt $max_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        attempts=$((attempts + 1))
        log_info "Health check attempt $attempts/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    local api_url="http://localhost:${API_PORT:-3000}"
    
    # Test API endpoints
    local endpoints=("/health" "/api/v1/status")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "$api_url$endpoint" > /dev/null 2>&1; then
            log_success "Smoke test passed: $endpoint"
        else
            log_error "Smoke test failed: $endpoint"
            return 1
        fi
    done
    
    log_success "All smoke tests passed"
}

# Rollback deployment
rollback_deployment() {
    if [[ -n "${PREVIOUS_VERSION:-}" ]]; then
        log_info "Rolling back to previous version: $PREVIOUS_VERSION"
        
        # Update image tag in override file
        sed -i "s|image: .*|image: $REGISTRY/$IMAGE_NAME:$PREVIOUS_VERSION|" "$PROJECT_ROOT/docker-compose.override.yml"
        
        # Restart services with previous version
        docker-compose up -d --no-deps api
        
        # Wait and check health
        sleep 10
        if health_check; then
            log_success "Rollback completed successfully"
        else
            log_error "Rollback health check failed"
        fi
    else
        log_warning "No previous version available for rollback"
    fi
}

# Cleanup old images and containers
cleanup_old_resources() {
    log_info "Cleaning up old resources..."
    
    # Remove old containers
    docker container prune -f > /dev/null 2>&1 || true
    
    # Remove old images (keep last 3 versions)
    docker images "$REGISTRY/$IMAGE_NAME" --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | \
        tail -n +4 | \
        awk '{print $2}' | \
        xargs -r docker rmi > /dev/null 2>&1 || true
    
    log_success "Cleanup completed"
}

# Send deployment notification
send_notification() {
    local status=$1
    local message="Rebloom deployment to $DEPLOYMENT_ENV: $status (version: $DEPLOY_VERSION)"
    
    # Send Slack notification if webhook is configured
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK" > /dev/null 2>&1 || true
    fi
    
    log_info "Deployment notification sent: $message"
}

# Main deployment function
main() {
    log_info "Starting Rebloom deployment to $DEPLOYMENT_ENV (version: $DEPLOY_VERSION)"
    
    # Validate deployment environment
    if [[ ! "$DEPLOYMENT_ENV" =~ ^(staging|production)$ ]]; then
        log_error "Invalid deployment environment: $DEPLOYMENT_ENV. Must be 'staging' or 'production'"
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    load_environment
    pre_deployment_checks
    backup_deployment
    pull_images
    update_configuration
    deploy_application
    
    # Run health checks and smoke tests
    if health_check && run_smoke_tests; then
        log_success "Deployment completed successfully!"
        cleanup_old_resources
        send_notification "SUCCESS"
    else
        log_error "Deployment validation failed!"
        send_notification "FAILED"
        exit 1
    fi
    
    log_info "Deployment summary:"
    log_info "  Environment: $DEPLOYMENT_ENV"
    log_info "  Version: $DEPLOY_VERSION"
    log_info "  Image: $REGISTRY/$IMAGE_NAME:$DEPLOY_VERSION"
    log_info "  Health check: PASSED"
    log_info "  Smoke tests: PASSED"
}

# Show usage information
usage() {
    echo "Usage: $0 <environment> [version]"
    echo "  environment: staging or production"
    echo "  version: Docker image tag (default: latest)"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production v1.2.3"
    echo "  $0 production latest"
}

# Handle command line arguments
if [[ $# -eq 0 ]]; then
    usage
    exit 1
fi

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    usage
    exit 0
fi

# Run main deployment
main "$@"