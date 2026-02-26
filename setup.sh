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
# ║     with PostgreSQL, NFS storage, SSL/TLS, and Docker Compose             ║
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

# SSL Configuration
DOMAIN=""
LETSENCRYPT_EMAIL=""
DNS_PROVIDER_NAME=""
DNS_CERTBOT_IMAGE=""
DNS_CREDENTIALS_FILE=""
DNS_CERTBOT_FLAGS=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
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

print_subsection() {
    echo ""
    echo -e "${GRAY}─────────────────────────────────────────────────────────────────────────────${NC}"
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

get_local_ips() {
    # Get local IP addresses
    if command_exists ip; then
        ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '^127\.' | head -5
    elif command_exists ifconfig; then
        ifconfig | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '^127\.' | head -5
    elif command_exists hostname; then
        hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^$' | head -5
    fi
}

read_masked_token() {
    local token=""
    local char=""

    while IFS= read -r -s -n1 char; do
        if [[ $char == $'\0' ]] || [[ $char == $'\n' ]]; then
            break
        elif [[ $char == $'\177' ]]; then
            if [[ -n "$token" ]]; then
                token="${token%?}"
                echo -ne "\b \b"
            fi
        else
            token+="$char"
            echo -n "*"
        fi
    done
    echo
    MASKED_INPUT="$token"
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
            print_success "Found 1 accessible export: ${ACCESSIBLE_EXPORTS[0]}"
            if confirm_prompt "Use ${ACCESSIBLE_EXPORTS[0]}?"; then
                nfs_path="${ACCESSIBLE_EXPORTS[0]}"
            else
                use_manual_entry=true
            fi
        else
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

    # Get local mount point
    echo ""
    echo -e "  ${GRAY}Choose where to mount the NFS share on this host.${NC}"
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

            print_info "Creating local mount point: $nfs_local_mount"
            mkdir -p "$nfs_local_mount"

            if grep -q "${nfs_server}:${nfs_path}" /etc/fstab 2>/dev/null; then
                print_warning "NFS entry already exists in /etc/fstab, updating..."
                sed -i "\|${nfs_server}:${nfs_path}|d" /etc/fstab
            fi

            print_info "Adding NFS mount to /etc/fstab..."
            echo "${nfs_server}:${nfs_path} ${nfs_local_mount} nfs defaults,_netdev 0 0" >> /etc/fstab

            print_info "Mounting NFS share..."
            if mount "$nfs_local_mount" 2>/dev/null; then
                print_success "NFS share mounted at $nfs_local_mount"
            else
                if mount -t nfs -o rw,nolock,soft "${nfs_server}:${nfs_path}" "$nfs_local_mount" 2>/dev/null; then
                    print_success "NFS share mounted at $nfs_local_mount"
                else
                    print_warning "Failed to mount NFS share. Check /etc/fstab and try 'mount -a'"
                fi
            fi

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
                    [ -z "$nfs_path" ] && continue
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
# DOMAIN CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

configure_domain() {
    print_section "Domain Configuration"

    echo ""
    echo -e "  ${GRAY}Enter the domain name where the UniFi Backup Manager will be accessible.${NC}"
    echo -e "  ${GRAY}Example: unifi-backup.yourdomain.com${NC}"
    echo ""

    while true; do
        echo -ne "  ${WHITE}Enter your domain${NC}: "
        read DOMAIN

        if [ -z "$DOMAIN" ]; then
            print_error "Domain is required"
            continue
        fi

        # Validate domain format
        if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$ ]]; then
            print_warning "Domain format may be invalid: $DOMAIN"
            if ! confirm_prompt "Continue anyway?" "n"; then
                continue
            fi
        fi

        break
    done

    # Validate domain
    validate_domain
}

validate_domain() {
    print_subsection
    echo -e "  ${WHITE}Validating domain configuration...${NC}"
    echo ""

    local local_ips=$(get_local_ips)
    local domain_ip=""
    local validation_passed=true

    echo -e "  ${WHITE}This server's IP addresses:${NC}"
    for local_ip in $local_ips; do
        echo -e "    ${CYAN}${local_ip}${NC}"
    done
    echo ""

    print_info "Resolving $DOMAIN..."

    if command_exists dig; then
        domain_ip=$(dig +short "$DOMAIN" 2>/dev/null | head -1)
    elif command_exists nslookup; then
        domain_ip=$(nslookup "$DOMAIN" 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    elif command_exists host; then
        domain_ip=$(host "$DOMAIN" 2>/dev/null | grep "has address" | awk '{print $4}' | head -1)
    elif command_exists getent; then
        domain_ip=$(getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1}' | head -1)
    fi

    if [ -z "$domain_ip" ]; then
        print_warning "Could not resolve $DOMAIN to an IP address"
        echo ""
        echo -e "  ${YELLOW}This could mean:${NC}"
        echo -e "    - The DNS record hasn't been created yet"
        echo -e "    - The DNS hasn't propagated yet"
        echo -e "    - The domain name is incorrect"
        echo ""
        validation_passed=false
    else
        print_success "Domain resolves to: $domain_ip"

        local ip_matches=false
        for local_ip in $local_ips; do
            if [ "$local_ip" = "$domain_ip" ]; then
                ip_matches=true
                break
            fi
        done

        if [ "$ip_matches" = true ]; then
            print_success "Domain IP matches this server"
        else
            print_warning "Domain IP ($domain_ip) does not match any local IP"
            echo ""
            echo -e "  ${YELLOW}This may cause SSL certificate validation to fail.${NC}"
            echo -e "  ${YELLOW}Please ensure DNS is properly configured.${NC}"
            validation_passed=false
        fi
    fi

    if [ "$validation_passed" = false ]; then
        echo ""
        if ! confirm_prompt "Continue with this domain anyway?" "n"; then
            configure_domain
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# DNS PROVIDER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

configure_dns_provider() {
    print_section "DNS Provider Configuration"

    echo ""
    echo -e "  ${GRAY}Let's Encrypt uses DNS validation to issue SSL certificates.${NC}"
    echo -e "  ${GRAY}This requires API access to your DNS provider.${NC}"
    echo ""

    echo -e "  ${WHITE}Select your DNS provider:${NC}"
    echo -e "    ${CYAN}1)${NC} Cloudflare"
    echo -e "    ${CYAN}2)${NC} AWS Route 53"
    echo -e "    ${CYAN}3)${NC} Google Cloud DNS"
    echo -e "    ${CYAN}4)${NC} DigitalOcean"
    echo -e "    ${CYAN}5)${NC} Other (manual configuration)"
    echo ""

    local dns_choice=""
    while [[ ! "$dns_choice" =~ ^[1-5]$ ]]; do
        echo -ne "  ${WHITE}Enter your choice [1-5]${NC}: "
        read dns_choice
    done

    case $dns_choice in
        1) configure_cloudflare ;;
        2) configure_route53 ;;
        3) configure_google_dns ;;
        4) configure_digitalocean ;;
        5) configure_other_dns ;;
    esac
}

configure_cloudflare() {
    DNS_PROVIDER_NAME="cloudflare"
    DNS_CERTBOT_IMAGE="certbot/dns-cloudflare:latest"
    DNS_CREDENTIALS_FILE="cloudflare.ini"

    print_subsection
    echo -e "  ${WHITE}Cloudflare API Configuration${NC}"
    echo ""
    echo -e "  ${GRAY}You need a Cloudflare API token with Zone:DNS:Edit permission.${NC}"
    echo -e "  ${GRAY}Create one at: https://dash.cloudflare.com/profile/api-tokens${NC}"
    echo ""

    echo -ne "  ${WHITE}Enter your Cloudflare API token${NC}: "
    read_masked_token
    local CF_API_TOKEN="$MASKED_INPUT"

    if [ -z "$CF_API_TOKEN" ]; then
        print_error "API token is required for Cloudflare"
        exit 1
    fi

    print_success "Cloudflare credentials saved"

    mkdir -p "${INSTALL_DIR}"
    cat > "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}" << EOF
dns_cloudflare_api_token = ${CF_API_TOKEN}
EOF
    chmod 600 "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}"

    DNS_CERTBOT_FLAGS="--dns-cloudflare --dns-cloudflare-credentials /credentials.ini --dns-cloudflare-propagation-seconds 60"
}

configure_route53() {
    DNS_PROVIDER_NAME="route53"
    DNS_CERTBOT_IMAGE="certbot/dns-route53:latest"
    DNS_CREDENTIALS_FILE="route53.ini"

    print_subsection
    echo -e "  ${WHITE}AWS Route 53 Configuration${NC}"
    echo ""

    echo -ne "  ${WHITE}Enter your AWS Access Key ID${NC}: "
    read_masked_token
    local AWS_ACCESS_KEY_ID="$MASKED_INPUT"

    echo -ne "  ${WHITE}Enter your AWS Secret Access Key${NC}: "
    read_masked_token
    local AWS_SECRET_ACCESS_KEY="$MASKED_INPUT"

    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        print_error "Both AWS credentials are required"
        exit 1
    fi

    print_success "AWS credentials saved"

    mkdir -p "${INSTALL_DIR}"
    cat > "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}" << EOF
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOF
    chmod 600 "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}"

    DNS_CERTBOT_FLAGS="--dns-route53"
}

configure_google_dns() {
    DNS_PROVIDER_NAME="google"
    DNS_CERTBOT_IMAGE="certbot/dns-google:latest"
    DNS_CREDENTIALS_FILE="google.json"

    print_subsection
    echo -e "  ${WHITE}Google Cloud DNS Configuration${NC}"
    echo ""

    echo -ne "  ${WHITE}Enter the path to your service account JSON file${NC}: "
    read GOOGLE_JSON_PATH

    if [ ! -f "$GOOGLE_JSON_PATH" ]; then
        print_error "File not found: $GOOGLE_JSON_PATH"
        exit 1
    fi

    mkdir -p "${INSTALL_DIR}"
    cp "$GOOGLE_JSON_PATH" "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}"
    chmod 600 "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}"
    print_success "Google credentials saved"

    DNS_CERTBOT_FLAGS="--dns-google --dns-google-credentials /credentials.json --dns-google-propagation-seconds 120"
}

configure_digitalocean() {
    DNS_PROVIDER_NAME="digitalocean"
    DNS_CERTBOT_IMAGE="certbot/dns-digitalocean:latest"
    DNS_CREDENTIALS_FILE="digitalocean.ini"

    print_subsection
    echo -e "  ${WHITE}DigitalOcean DNS Configuration${NC}"
    echo ""

    echo -ne "  ${WHITE}Enter your DigitalOcean API token${NC}: "
    read_masked_token
    local DO_API_TOKEN="$MASKED_INPUT"

    if [ -z "$DO_API_TOKEN" ]; then
        print_error "API token is required"
        exit 1
    fi

    print_success "DigitalOcean credentials saved"

    mkdir -p "${INSTALL_DIR}"
    cat > "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}" << EOF
dns_digitalocean_token = ${DO_API_TOKEN}
EOF
    chmod 600 "${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}"

    DNS_CERTBOT_FLAGS="--dns-digitalocean --dns-digitalocean-credentials /credentials.ini --dns-digitalocean-propagation-seconds 60"
}

configure_other_dns() {
    DNS_PROVIDER_NAME="manual"
    DNS_CERTBOT_IMAGE="certbot/certbot:latest"
    DNS_CREDENTIALS_FILE=""
    DNS_CERTBOT_FLAGS="--manual --preferred-challenges dns"

    print_warning "Manual DNS configuration selected"
    echo -e "  ${GRAY}You will need to manually add DNS TXT records when prompted.${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# LETSENCRYPT EMAIL CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

configure_letsencrypt_email() {
    print_section "Let's Encrypt Configuration"

    echo ""
    echo -e "  ${GRAY}Let's Encrypt requires a valid email for certificate expiration notices.${NC}"
    echo ""

    while true; do
        echo -ne "  ${WHITE}Email address for Let's Encrypt${NC}: "
        read email_input

        if [ -z "$email_input" ]; then
            print_error "Email address is required"
            continue
        fi

        if [[ ! "$email_input" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
            print_error "Invalid email format. Please enter a valid email address."
            continue
        fi

        LETSENCRYPT_EMAIL="$email_input"
        print_success "Email set to: $LETSENCRYPT_EMAIL"
        break
    done
}

# ═══════════════════════════════════════════════════════════════════════════════
# SSL CERTIFICATE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════

create_letsencrypt_volume() {
    if docker volume inspect letsencrypt >/dev/null 2>&1; then
        print_info "Volume 'letsencrypt' already exists"
    else
        docker volume create letsencrypt
        print_success "Volume 'letsencrypt' created"
    fi
}

obtain_ssl_certificate() {
    print_section "Obtaining SSL Certificate"

    local cred_volume_opt=""
    local domains_arg="-d $DOMAIN"

    # Setup credential volume mapping
    case $DNS_PROVIDER_NAME in
        cloudflare|digitalocean)
            cred_volume_opt="-v ${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}:/credentials.ini:ro"
            ;;
        route53)
            cred_volume_opt="-v ${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}:/root/.aws/credentials:ro"
            ;;
        google)
            cred_volume_opt="-v ${INSTALL_DIR}/${DNS_CREDENTIALS_FILE}:/credentials.json:ro"
            ;;
    esac

    mkdir -p "${INSTALL_DIR}/letsencrypt-temp"

    print_info "Requesting SSL certificate for $DOMAIN..."
    print_info "This may take a few minutes for DNS propagation..."

    if ! docker run --rm \
        -v "${INSTALL_DIR}/letsencrypt-temp:/etc/letsencrypt" \
        $cred_volume_opt \
        $DNS_CERTBOT_IMAGE \
        certonly \
        $DNS_CERTBOT_FLAGS \
        $domains_arg \
        --agree-tos \
        --non-interactive \
        --email "$LETSENCRYPT_EMAIL"; then
        print_error "Failed to obtain SSL certificate"
        echo ""
        echo -e "  ${YELLOW}Common issues:${NC}"
        echo -e "    - DNS API credentials may be incorrect"
        echo -e "    - Domain may not be managed by the specified DNS provider"
        echo -e "    - Rate limit exceeded (wait and try again later)"
        echo ""
        exit 1
    fi

    print_success "SSL certificate obtained"

    # Copy to Docker volume
    docker run --rm \
        -v "${INSTALL_DIR}/letsencrypt-temp:/source:ro" \
        -v letsencrypt:/dest \
        alpine \
        sh -c "cp -rL /source/* /dest/"

    rm -rf "${INSTALL_DIR}/letsencrypt-temp"
    print_success "Certificates copied to Docker volume"
}

# ═══════════════════════════════════════════════════════════════════════════════
# NGINX CONFIGURATION GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

generate_nginx_conf() {
    print_info "Generating nginx configuration..."

    cat > "${INSTALL_DIR}/nginx.conf" << 'NGINX_EOF'
# UniFi Backup Manager - Nginx Configuration
# Generated by setup.sh

worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name DOMAIN_PLACEHOLDER;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name DOMAIN_PLACEHOLDER;

        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

        # Frontend (Vue.js app)
        location / {
            proxy_pass http://frontend:80;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend:8000/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # Timeouts for long-running backup operations
            proxy_connect_timeout 600;
            proxy_send_timeout 600;
            proxy_read_timeout 600;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://backend:8000/api/health;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
    }
}
NGINX_EOF

    # Replace domain placeholder
    sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "${INSTALL_DIR}/nginx.conf"

    print_success "nginx.conf generated"
}

# ═══════════════════════════════════════════════════════════════════════════════
# DOCKER COMPOSE GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

generate_docker_compose() {
    print_section "Generating Docker Compose Configuration"

    local backup_volume_config=""
    local backup_mount=""

    if [ "$NFS_CONFIGURED" = "true" ] && [ -n "$NFS_LOCAL_MOUNT" ]; then
        backup_mount="      - ${NFS_LOCAL_MOUNT}:/backups"
        print_info "Using NFS storage: ${NFS_SERVER}:${NFS_PATH}"
    else
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
    security_opt:
      - apparmor:unconfined
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
    security_opt:
      - apparmor:unconfined
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
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - unifi-backup-net

  frontend:
    image: \${DOCKERHUB_USERNAME:-rjsears}/unifi-backup-frontend:\${IMAGE_TAG:-latest}
    container_name: unifi-backup-frontend
    security_opt:
      - apparmor:unconfined
    restart: unless-stopped
    networks:
      - unifi-backup-net

  nginx:
    image: nginx:alpine
    container_name: unifi-backup-nginx
    security_opt:
      - apparmor:unconfined
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - unifi-backup-net

  certbot:
    image: ${DNS_CERTBOT_IMAGE:-certbot/certbot:latest}
    container_name: unifi-backup-certbot
    security_opt:
      - apparmor:unconfined
    volumes:
      - letsencrypt:/etc/letsencrypt
      - ./certbot_data:/var/www/certbot
COMPOSE_EOF

    # Add credentials mount for certbot if needed
    if [ -n "$DNS_CREDENTIALS_FILE" ]; then
        cat >> "${INSTALL_DIR}/docker-compose.yaml" << COMPOSE_EOF
      - ./${DNS_CREDENTIALS_FILE}:/credentials.ini:ro
COMPOSE_EOF
    fi

    cat >> "${INSTALL_DIR}/docker-compose.yaml" << COMPOSE_EOF
    entrypoint: /bin/sh -c "trap exit TERM; while :; do certbot renew ${DNS_CERTBOT_FLAGS} || true; sleep 12h & wait \$\${!}; done;"
    restart: unless-stopped
    networks:
      - unifi-backup-net

volumes:
${backup_volume_config}
  postgres_data:
    driver: local
  letsencrypt:
    external: true

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

# Domain
DOMAIN=${DOMAIN}

# Database
POSTGRES_USER=unifi_backup
POSTGRES_PASSWORD=$(generate_secret)
POSTGRES_DB=unifi_backups

# Security
SECRET_KEY=$(generate_secret)
FERNET_KEY=$(generate_fernet_key)

# Server
LOG_LEVEL=INFO

# SSL/TLS
DNS_PROVIDER=${DNS_PROVIDER_NAME}
LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}

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

    # Create letsencrypt volume
    create_letsencrypt_volume

    # Obtain SSL certificate
    obtain_ssl_certificate

    # Generate nginx config
    generate_nginx_conf

    print_info "Pulling Docker images..."
    docker compose pull

    print_info "Starting services..."
    docker compose up -d

    print_info "Waiting for services to start..."
    sleep 15

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
        if curl -sf "https://${DOMAIN}/health" 2>/dev/null | grep -q "healthy"; then
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

    # Check for openssl
    if ! command_exists openssl; then
        print_error "OpenSSL is not installed."
        exit 1
    fi
    print_success "OpenSSL found"

    # Check for curl
    if ! command_exists curl; then
        print_error "curl is not installed."
        exit 1
    fi
    print_success "curl found"

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

    # Configure domain
    configure_domain

    # Configure DNS provider for SSL
    configure_dns_provider

    # Configure Let's Encrypt email
    configure_letsencrypt_email

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
    echo -e "    ${CYAN}https://${DOMAIN}${NC}"
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
    echo -e "  ${WHITE}SSL Certificate:${NC}"
    echo -e "    Provider: ${CYAN}Let's Encrypt${NC}"
    echo -e "    DNS Provider: ${CYAN}${DNS_PROVIDER_NAME}${NC}"
    echo -e "    Auto-renewal: ${GREEN}Enabled${NC}"
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
