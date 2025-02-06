#!/bin/bash

certbot certonly --non-interactive --webroot --webroot-path /var/www/certbot --agree-tos -d testrps.xyz -m 

wait $!

if [[ $? -eq 0 ]]; then
    nginx -s reload
fi