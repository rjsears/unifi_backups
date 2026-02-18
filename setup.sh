#!/bin/bash
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# /setup.sh
#
# UniFi Backup Manager - Server Setup Script
# Version 1.0.0 - February 2026
#
# Richard J. Sears
# https://github.com/rjsears
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║     UniFi Backup Manager - Interactive Setup Script                       ║
# ║                                                                           ║
# ║     Automated setup and deployment for UniFi backup management            ║
# ║     with PostgreSQL, NFS storage support, and Docker Compose              ║
# ║                                                                           ║
# ║     Version 1.0.0                                                         ║
# ║     Richard J. Sears                                                      ║
# ║     February 2026                                                         ║
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -e

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION & CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default paths
INSTALL_DIR="${INSTALL_DIR:-/opt/unifi-backup}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/opt/unifi-backup/backups}"

# NFS Configuration
NFS_CONFIGURED="false"
NFS_SERVER=""
NFS_PATH=""
NFS_LOCAL_MOUNT=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() {
    echo -e "  ${CYAN}ℹ${NC} $1"
}

print_success() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "  ${RED}✗${NC} $1"
}

print_warning() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

command_exists() {
    command -v "$1" &> /dev/null
}

confirm_prompt() {
    local prompt="$1"
    local default="${2:-y}"
    local response

    if [ "$default" = "y" ]; then
        echo -ne "  ${WHITE}${prompt} [Y/n]${NC}: "
    else
        echo -ne "  ${WHITE}${prompt} [y/N]${NC}: "
    fi

    read response
    response=${response:-$default}

    [[ "$response" =~ ^[Yy]$ ]]
}

generate_secret() {
    openssl rand -base64 32 | tr -d '/+=' | head -c 32
}

generate_fernet_key() {
    # Fernet key must be 32 url-safe base64-encoded bytes
    python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || \
    docker run --rm python:3.11-slim python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
}

# ═══════════════════════════════════════════════════════════════════════════════
# NFS CLIENT INSTALLATION
# ═══════════════════════════════════════════════════════════════════════════════

install_nfs_client() {
    print_info "Installing NFS client..."

    if [ -f /etc/debian_version ]; then
        apt-get update -qq
        apt-get install -y -qq nfs-common
    elif [ -f /etc/redhat-release ]; then
        if command_exists dnf; then
            dnf install -y -q nfs-utils
        else
            yum install -y -q nfs-utils
        fi
    elif [ -f /etc/alpine-release ]; then
        apk add --quiet nfs-utils
    else
        print_error "Cannot determine package manager. Please install NFS client manually."
        return 1
    fi

    print_success "NFS client installed"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# GET ACCESSIBLE NFS EXPORTS
# ═══════════════════════════════════════════════════════════════════════════════

get_accessible_exports() {
    local nfs_server="$1"
    ACCESSIBLE_EXPORTS=()

    local exports_output
    exports_output=$(showmount -e "$nfs_server" 2>/dev/null | tail -n +2)

    if [ -z "$exports_output" ]; then
        return 1
    fi

    while IFS= read -r line; do
        local export_path
        export_path=$(echo "$line" | awk '{print $1}')
        if [ -n "$export_path" ]; then
            ACCESSIBLE_EXPORTS+=("$export_path")
        fi
    done <<< "$exports_output"

    [ ${#ACCESSIBLE_EXPORTS[@]} -gt 0 ]
}

# ═══════════════════════════════════════════════════════════════════════════════
# NFS CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

configure_nfs() {
    print_section "NFS Backup Storage Configuration"

    echo ""
    echo -e "  ${GRAY}NFS storage allows centralized backup storage on a remote server.${NC}"
    echo -e "  ${GRAY}The NFS share will be mounted on this host and bind-mounted into Docker.${NC}"
    echo -e "  ${GRAY}If you skip this, backups will be stored locally.${NC}"
    echo ""

    if ! confirm_prompt "Configure NFS for backup storage?" "n"; then
        NFS_CONFIGURED="false"
        NFS_SERVER=""
        NFS_PATH=""
        NFS_LOCAL_MOUNT=""
        print_info "Skipping NFS configuration. Backups will be stored locally."
        return
    fi

    # Check NFS client
    if ! command_exists showmount; then
        print_warning "NFS client is not installed."
        if confirm_prompt "Would you like to install NFS client now?"; then
            if ! install_nfs_client; then
                NFS_CONFIGURED="false"
                return
            fi
        else
            print_error "NFS client is required for NFS backup storage."
            NFS_CONFIGURED="false"
            return
        fi
    fi

    # Get NFS server
    local nfs_server=""
    while true; do
        echo ""
        echo -ne "  ${WHITE}NFS server address (e.g., 192.168.1.100 or nas.local)${NC}: "
        read nfs_server

        if [ -z "$nfs_server" ]; then
            print_error "NFS server is required"
            continue
        fi

        # Test connectivity
        print_info "Testing connection to $nfs_server..."
        if ! timeout 5 showmount -e "$nfs_server" &>/dev/null; then
            print_error "Cannot connect to NFS server: $nfs_server"
            if confirm_prompt "Try again?"; then
                continue
            else
                NFS_CONFIGURED="false"
                return
            fi
        fi

        print_success "NFS server is reachable"
        break
    done

    # Get accessible exports
    echo ""
    print_info "Checking for accessible NFS exports..."

    local nfs_path=""
    local use_manual_entry=false

    if get_accessible_exports "$nfs_server"; then
        if [ ${#ACCESSIBLE_EXPORTS[@]} -eq 1 ]; then
            # Only one export available
            print_success "Found 1 accessible export: ${ACCESSIBLE_EXPORTS[0]}"
            if confirm_prompt "Use ${ACCESSIBLE_EXPORTS[0]}?"; then
                nfs_path="${ACCESSIBLE_EXPORTS[0]}"
            else
                use_manual_entry=true
            fi
        else
            # Multiple exports - list them
            print_success "Found ${#ACCESSIBLE_EXPORTS[@]} accessible exports:"
            echo ""
            local i=1
            for export in "${ACCESSIBLE_EXPORTS[@]}"; do
                echo -e "    ${CYAN}${i})${NC} ${export}"
                ((i++))
            done
            echo -e "    ${CYAN}${i})${NC} [Enter path manually]"
            echo ""

            local choice=""
            while true; do
                echo -ne "  ${WHITE}Select export [1-${i}]${NC}: "
                read choice
                if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "$i" ]; then
                    break
                fi
                print_error "Invalid selection"
            done

            if [ "$choice" -eq "$i" ]; then
                use_manual_entry=true
            else
                nfs_path="${ACCESSIBLE_EXPORTS[$((choice-1))]}"
            fi
        fi
    else
        print_warning "No exports found or unable to query exports"
        echo ""
        echo -e "  ${GRAY}All exports on server (if accessible):${NC}"
        showmount -e "$nfs_server" 2>/dev/null | tail -n +2 | sed 's/^/    /' || echo "    (unable to query exports)"
        echo ""
        use_manual_entry=true
    fi

    # Manual entry fallback
    if [ "$use_manual_entry" = true ]; then
        echo ""
        echo -ne "  ${WHITE}NFS export path (e.g., /exports/backups)${NC}: "
        read nfs_path

        if [ -z "$nfs_path" ]; then
            print_error "NFS path is required"
            NFS_CONFIGURED="false"
            return
        fi
    fi

    # Get local mount point on host
    echo ""
    echo -e "  ${GRAY}Choose where to mount the NFS share on this host.${NC}"
    echo -e "  ${GRAY}This directory will be created if it doesn't exist.${NC}"
    echo ""
    echo -ne "  ${WHITE}Local mount point [/opt/unifi_backups]${NC}: "
    read nfs_local_mount
    nfs_local_mount="${nfs_local_mount:-/opt/unifi_backups}"

    # Test the NFS mount
    while true; do
        print_info "Testing NFS mount: ${nfs_server}:${nfs_path}..."
        local test_mount="/tmp/nfs_test_$$"
        mkdir -p "$test_mount"

        if mount -t nfs -o ro,nolock,soft,timeo=10 "${nfs_server}:${nfs_path}" "$test_mount" 2>/dev/null; then
            print_success "NFS mount test successful"
            umount "$test_mount" 2>/dev/null || true
            rmdir "$test_mount" 2>/dev/null || true

            # Create local mount point
            print_info "Creating local mount point: $nfs_local_mount"
            mkdir -p "$nfs_local_mount"

            # Check if already in fstab
            if grep -q "${nfs_server}:${nfs_path}" /etc/fstab 2>/dev/null; then
                print_warning "NFS entry already exists in /etc/fstab, updating..."
                sed -i "\|${nfs_server}:${nfs_path}|d" /etc/fstab
            fi

            # Add to fstab
            print_info "Adding NFS mount to /etc/fstab..."
            echo "${nfs_server}:${nfs_path} ${nfs_local_mount} nfs defaults,_netdev 0 0" >> /etc/fstab

            # Mount the NFS share
            print_info "Mounting NFS share..."
            if mount "$nfs_local_mount" 2>/dev/null; then
                print_success "NFS share mounted at $nfs_local_mount"
            else
                # Try with explicit options
                if mount -t nfs -o rw,nolock,soft "${nfs_server}:${nfs_path}" "$nfs_local_mount" 2>/dev/null; then
                    print_success "NFS share mounted at $nfs_local_mount"
                else
                    print_warning "Failed to mount NFS share. Check /etc/fstab and try 'mount -a'"
                fi
            fi

            # Verify mount is writable
            if touch "${nfs_local_mount}/.unifi_test_write" 2>/dev/null; then
                rm -f "${nfs_local_mount}/.unifi_test_write"
                print_success "NFS share is writable"
            else
                print_warning "NFS share may not be writable - check permissions on NFS server"
            fi

            NFS_SERVER="$nfs_server"
            NFS_PATH="$nfs_path"
            NFS_LOCAL_MOUNT="$nfs_local_mount"
            NFS_CONFIGURED="true"
            return
        else
            print_error "Failed to mount NFS share: ${nfs_server}:${nfs_path}"
            rmdir "$test_mount" 2>/dev/null || true

            echo ""
            echo -e "  ${WHITE}Options:${NC}"
            echo -e "    ${CYAN}1)${NC} Try a different export path"
            echo -e "    ${CYAN}2)${NC} Try a different NFS server"
            echo -e "    ${CYAN}3)${NC} Continue without NFS (backups stored locally)"
            echo -e "    ${CYAN}4)${NC} Exit setup"
            echo ""

            local nfs_choice=""
            while [[ ! "$nfs_choice" =~ ^[1-4]$ ]]; do
                echo -ne "  ${WHITE}Enter your choice [1-4]${NC}: "
                read nfs_choice
            done

            case $nfs_choice in
                1)
                    echo -ne "  ${WHITE}NFS export path${NC}: "
                    read nfs_path
                    if [ -z "$nfs_path" ]; then
                        continue
                    fi
                    ;;
                2)
                    configure_nfs
                    return
                    ;;
                3)
                    NFS_CONFIGURED="false"
                    NFS_LOCAL_MOUNT=""
                    print_info "Continuing without NFS. Backups will be stored locally."
                    return
                    ;;
                4)
                    exit 1
                    ;;
            esac
        fi
    done
}

# ═══════════════════════════════════════════════════════════════════════════════
# DOCKER COMPOSE GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

generate_docker_compose() {
    print_section "Generating Docker Compose Configuration"

    local backup_volume_config=""
    local backup_mount=""

    if [ "$NFS_CONFIGURED" = "true" ] && [ -n "$NFS_LOCAL_MOUNT" ]; then
        # Use bind mount from host NFS mount point
        backup_mount="      - ${NFS_LOCAL_MOUNT}:/backups"
        print_info "Using NFS storage: ${NFS_SERVER}:${NFS_PATH}"
    else
        # Use local Docker volume
        backup_mount="      - backup_data:/backups"
        backup_volume_config="  backup_data:
    driver: local"
        print_info "Using local storage"
    fi

    cat > "${INSTALL_DIR}/docker-compose.yaml" << COMPOSE_EOF
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Docker Compose (Production)
# Generated by setup.sh on $(date)
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: unifi-backup-db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=\${POSTGRES_USER:-unifi_backup}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      - POSTGRES_DB=\${POSTGRES_DB:-unifi_backups}
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-unifi_backup} -d \${POSTGRES_DB:-unifi_backups}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - unifi-backup-net

  backend:
    image: \${DOCKERHUB_USERNAME:-rjsears}/unifi-backup-api:\${IMAGE_TAG:-latest}
    container_name: unifi-backup-api
    volumes:
${backup_mount}
    environment:
      - DATABASE_URL=postgresql+asyncpg://\${POSTGRES_USER:-unifi_backup}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB:-unifi_backups}
      - BACKUP_PATH=/backups
      - SECRET_KEY=\${SECRET_KEY:?SECRET_KEY is required}
      - FERNET_KEY=\${FERNET_KEY:?FERNET_KEY is required}
      - DEBUG=false
      - LOG_LEVEL=\${LOG_LEVEL:-INFO}
      - ADMIN_USERNAME=\${ADMIN_USERNAME:-admin}
      - ADMIN_EMAIL=\${ADMIN_EMAIL:-admin@localhost}
      - ADMIN_PASSWORD=\${ADMIN_PASSWORD}
      - CORS_ORIGINS=["http://localhost","http://localhost:80","https://\${DOMAIN:-localhost}"]
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - unifi-backup-net

  frontend:
    image: \${DOCKERHUB_USERNAME:-rjsears}/unifi-backup-frontend:\${IMAGE_TAG:-latest}
    container_name: unifi-backup-frontend
    ports:
      - "\${HTTP_PORT:-80}:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - unifi-backup-net

volumes:
${backup_volume_config}
  postgres_data:
    driver: local

networks:
  unifi-backup-net:
    driver: bridge
COMPOSE_EOF

    print_success "docker-compose.yaml generated"
}

# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN USER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

configure_admin() {
    print_section "Admin User Configuration"

    echo ""
    echo -e "  ${GRAY}Configure the initial administrator account.${NC}"
    echo ""

    echo -ne "  ${WHITE}Admin username [admin]${NC}: "
    read ADMIN_USER
    ADMIN_USER="${ADMIN_USER:-admin}"

    echo -ne "  ${WHITE}Admin email [admin@localhost]${NC}: "
    read ADMIN_EMAIL
    ADMIN_EMAIL="${ADMIN_EMAIL:-admin@localhost}"

    while true; do
        echo -ne "  ${WHITE}Admin password (min 8 chars)${NC}: "
        read -s ADMIN_PASS
        echo
        if [[ ${#ADMIN_PASS} -ge 8 ]]; then
            break
        fi
        print_error "Password must be at least 8 characters"
    done

    print_success "Admin user configured: ${ADMIN_USER}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# ENVIRONMENT FILE GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

generate_env_file() {
    print_section "Generating Environment Configuration"

    # Docker Hub username
    echo ""
    echo -ne "  ${WHITE}Docker Hub username [rjsears]${NC}: "
    read DOCKERHUB_USER
    DOCKERHUB_USER="${DOCKERHUB_USER:-rjsears}"

    print_info "Generating secure secrets..."

    cat > "${INSTALL_DIR}/.env" << ENV_EOF
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Environment Configuration
# Generated by setup.sh on $(date)
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

# Docker Hub
DOCKERHUB_USERNAME=${DOCKERHUB_USER}
IMAGE_TAG=latest

# Database
POSTGRES_USER=unifi_backup
POSTGRES_PASSWORD=$(generate_secret)
POSTGRES_DB=unifi_backups

# Security
SECRET_KEY=$(generate_secret)
FERNET_KEY=$(generate_fernet_key)

# Server
HTTP_PORT=80
LOG_LEVEL=INFO

# Storage Configuration
NFS_CONFIGURED=${NFS_CONFIGURED}
NFS_SERVER=${NFS_SERVER}
NFS_PATH=${NFS_PATH}
NFS_LOCAL_MOUNT=${NFS_LOCAL_MOUNT}

# Initial Admin User
ADMIN_USERNAME=${ADMIN_USER}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASS}
ENV_EOF

    chmod 600 "${INSTALL_DIR}/.env"
    print_success ".env file created with secure secrets"
}

# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOYMENT
# ═══════════════════════════════════════════════════════════════════════════════

deploy_services() {
    print_section "Deploying Services"

    cd "${INSTALL_DIR}"

    print_info "Pulling Docker images..."
    docker compose pull

    print_info "Starting services..."
    docker compose up -d

    print_info "Waiting for services to start..."
    sleep 10

    if docker compose ps | grep -q "running"; then
        print_success "Services are running!"
    else
        print_warning "Some services may not be running properly"
        docker compose ps
    fi

    # Wait for API to be ready
    print_info "Waiting for API to be ready..."
    local max_attempts=30
    local attempt=0
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s http://localhost:${HTTP_PORT:-80}/api/health 2>/dev/null | grep -q "healthy"; then
            print_success "API is ready!"
            break
        fi
        echo -ne "\r  ${CYAN}ℹ${NC} Waiting for API... (attempt $((attempt+1))/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    echo ""

    if [[ $attempt -eq $max_attempts ]]; then
        print_warning "API may not be fully ready yet. The admin user will be created on first startup."
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN SETUP FLOW
# ═══════════════════════════════════════════════════════════════════════════════

main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                           ║"
    echo "║     UniFi Backup Manager - Interactive Setup Script                       ║"
    echo "║                                                                           ║"
    echo "║     Version ${SCRIPT_VERSION}                                                         ║"
    echo "║                                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi

    # Check for Docker
    print_section "Checking Prerequisites"

    if ! command_exists docker; then
        print_error "Docker is not installed."
        echo "  Please install Docker first: https://docs.docker.com/engine/install/"
        exit 1
    fi
    print_success "Docker found: $(docker --version | head -1)"

    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed."
        echo "  Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose found: $(docker compose version --short)"

    # Create installation directory
    print_info "Creating installation directory: ${INSTALL_DIR}"
    mkdir -p "${INSTALL_DIR}"

    # Check for existing installation
    if [[ -f "${INSTALL_DIR}/.env" ]]; then
        print_warning "Existing installation found at ${INSTALL_DIR}"
        if ! confirm_prompt "Do you want to overwrite the existing configuration?"; then
            print_info "Setup cancelled. Existing configuration preserved."
            exit 0
        fi
    fi

    # Configure NFS (optional)
    configure_nfs

    # Configure admin user
    configure_admin

    # Generate environment file
    generate_env_file

    # Generate docker-compose.yaml
    generate_docker_compose

    # Deploy services
    deploy_services

    # Print summary
    print_section "Setup Complete!"

    echo ""
    echo -e "  ${WHITE}Access the web interface at:${NC}"
    echo -e "    ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
    echo ""
    echo -e "  ${WHITE}Admin credentials:${NC}"
    echo -e "    Username: ${CYAN}${ADMIN_USER}${NC}"
    echo -e "    Password: ${CYAN}(the password you entered)${NC}"
    echo ""

    if [ "$NFS_CONFIGURED" = "true" ]; then
        echo -e "  ${WHITE}Backup storage:${NC}"
        echo -e "    ${CYAN}NFS - ${NFS_SERVER}:${NFS_PATH}${NC}"
        echo -e "    Mounted at: ${CYAN}${NFS_LOCAL_MOUNT}${NC}"
    else
        echo -e "  ${WHITE}Backup storage:${NC}"
        echo -e "    ${CYAN}Local Docker volume${NC}"
    fi
    echo ""
    echo -e "  ${WHITE}Configuration files:${NC} ${CYAN}${INSTALL_DIR}${NC}"
    echo ""
    echo -e "  ${WHITE}Useful commands:${NC}"
    echo -e "    View logs:      ${GRAY}cd ${INSTALL_DIR} && docker compose logs -f${NC}"
    echo -e "    Stop services:  ${GRAY}cd ${INSTALL_DIR} && docker compose down${NC}"
    echo -e "    Start services: ${GRAY}cd ${INSTALL_DIR} && docker compose up -d${NC}"
    echo -e "    Update images:  ${GRAY}cd ${INSTALL_DIR} && docker compose pull && docker compose up -d${NC}"
    echo ""
}

# Run main
main "$@"
