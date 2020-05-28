#!/bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/ssl/private/vsftpd.key -out /etc/ssl/certs/vsftpd.crt \
-subj '/CN=localhost' -extensions EXT -config <( \
printf "[dn]\nCN=ftps-server\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:ftps-server\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")