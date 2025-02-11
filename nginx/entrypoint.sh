#!/bin/bash

nginx -c /etc/nginx/certbot.nginx.conf &

echo "Waiting for nginx to start..."
sleep 3

echo "Running Certbot..."
certbot certonly --non-interactive --webroot --webroot-path /var/www/certbot --agree-tos -d testrps.xyz -m REDACTED_EMAIL


if [[ $? -eq 0 ]]; then
    echo "Certbot Succeeded, reloading Nginx..."
    nginx -s stop
    nginx -c /etc/nginx/nginx.conf -g "daemon off;"
else
    echo "Certbot failed"
    cat var/log/letsencrypt/letsencrypt.log
fi

