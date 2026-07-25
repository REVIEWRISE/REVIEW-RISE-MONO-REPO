#!/bin/bash

# ==============================================================================
# SSL Certificate Initialization Script
# ==============================================================================
# Usage: ./scripts/init-ssl.sh [email]
# ==============================================================================

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

set -e # Exit immediately if any command fails

domains=(vyntrise.com seo-analyzer.vyntrise.com app.vyntrise.com crm.vyntrise.com)
rsa_key_size=4096
data_path="./nginx/certbot"
email="support@vyntrise.com" # Change this to your email
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

if [ -d "$data_path" ]; then
  if [ "${1:-}" == "--non-interactive" ] || [ "${1:-}" == "--force" ]; then
     echo "Existing data found. Overwriting due to --non-interactive flag."
  else
    read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
      exit
    fi
  fi
fi


if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

# Request a separate certificate for each domain
for domain in "${domains[@]}"; do
  echo "### Creating dummy certificate for $domain ..."
  path="/etc/letsencrypt/live/$domain"
  mkdir -p "$data_path/conf/live/$domain"
  docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 365\
      -keyout '$path/privkey.pem' \
      -out '$path/fullchain.pem' \
      -subj '/CN=$domain'" certbot
  echo
done

echo "### Starting nginx ..."
docker compose -f docker-compose.prod.yml up --force-recreate -d nginx
echo

for domain in "${domains[@]}"; do
  echo "### Deleting dummy certificate for $domain ..."
  docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$domain && \
    rm -Rf /etc/letsencrypt/archive/$domain && \
    rm -Rf /etc/letsencrypt/renewal/$domain.conf" certbot
  echo

  echo "### Requesting Let's Encrypt certificate for $domain ..."

  # Select appropriate email arg
  case "$email" in
    "") email_arg="--register-unsafely-without-email" ;;
    *) email_arg="--email $email" ;;
  esac

  # Enable staging mode if needed
  staging_arg=""
  if [ $staging != "0" ]; then staging_arg="--staging"; fi

  # Request both bare and www domains for the main site
  domain_args="-d $domain"
  if [ "$domain" = "vyntrise.com" ]; then
    domain_args="-d vyntrise.com -d www.vyntrise.com"
  fi

  if ! docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      $domain_args \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --cert-name $domain \
      " certbot; then
      echo
      echo "### [ERROR] Let's Encrypt request failed for $domain!"
      echo "### Fallback: Restoring dummy certificate..."
      mkdir -p "$data_path/conf/live/$domain"
      docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
        openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 365\
          -keyout '$path/privkey.pem' \
          -out '$path/fullchain.pem' \
          -subj '/CN=$domain'" certbot
      echo "### Dummy certificate restored for $domain."
  fi
  echo
done

echo "### Creating symlinks for versioned certificates..."
# Check if certificates were created with version suffixes and create symlinks
for domain in "${domains[@]}"; do
  # Find the actual certificate directory (may have -0001, -0002 suffix)
  ACTUAL_CERT=$(docker compose -f docker-compose.prod.yml run --rm --entrypoint "sh -c 'ls -d /etc/letsencrypt/live/${domain}* 2>/dev/null | head -1'" certbot | tr -d '\r')
  
  if [ -n "$ACTUAL_CERT" ] && [ "$ACTUAL_CERT" != "/etc/letsencrypt/live/$domain" ]; then
    CERT_BASENAME=$(basename "$ACTUAL_CERT")
    echo "Found versioned certificate: $CERT_BASENAME for $domain"
    
    # Create symlink from base name to versioned name
    docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
      sh -c 'cd /etc/letsencrypt/live && \
             rm -f $domain && \
             ln -sf $CERT_BASENAME $domain && \
             ls -la $domain'" certbot
    
    echo "Created symlink: $domain -> $CERT_BASENAME"
  else
    echo "Certificate for $domain is at expected location"
  fi
done
echo

echo "### Reloading nginx ..."
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
