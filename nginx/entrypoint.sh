#!/bin/bash

DOMAIN="testrps.xyz"
EMAIL="${EMAIL_ADDRESS}"
WEBROOT_PATH="/var/www/certbot"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
IS_TESTING=false

get_certs() {
	echo "No certifications found. Getting new certs..."
	if $IS_TESTING; then
		echo "Getting test certs..."
		certbot certonly --non-interactive --webroot --webroot-path "$WEBROOT_PATH" \
		--agree-tos -d "$DOMAIN" -m "$EMAIL" --staging --break-my-certs
	else
		certbot certonly --non-interactive --webroot --webroot-path "$WEBROOT_PATH" \
		--agree-tos -d "$DOMAIN" -m "$EMAIL"
	fi
}

setup_cron_job() {
	echo "Setting up cron job for renewal..."
	echo "0 0, 12 * * * /usr/bin/certbot renew --quiet --post-hook 'nginx -s reload'" \ 
	> /etc/cron.d/certbot-renew
	chmod 0644 /etc/cron.d/certbot-renew
	crontab /etc/cron.d/certbot-renew
}

#start nginx with dummy config to serve the certbot challenge
nginx -c /etc/nginx/certbot.nginx.conf &

echo "Waiting for nginx to start..."
sleep 3

echo "Checking for certs..."
# echo "CERT_DIR contents:"
# ls -la "$CERT_DIR" || echo "CERT_DIR does not exist or is inaccessible"
# echo "Checking fullchain.pem: $(test -f "$CERT_DIR/fullchain.pem" && echo 'exists' || echo 'missing')"
# echo "Checking privkey.pem: $(test -f "$CERT_DIR/privkey.pem" && echo 'exists' || echo 'missing')"
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    get_certs
fi

if [[ $? -eq 0 ]]; then
	echo "Begining cronjob"
	#begin cron job
	setup_cron_job
	service cron start

	#restart nginx with actual config
	#this must run last because it will not exit
	nginx -s stop
	nginx -c /etc/nginx/nginx.conf -g "daemon off;"	
else
    echo "Certbot failed"
    cat var/log/letsencrypt/letsencrypt.log
fi

