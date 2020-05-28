FROM alpine:3.10
RUN apk --no-cache add vsftpd
RUN apk --no-cache add openssl
RUN apk add --no-cache bash coreutils grep sed

COPY cert.conf cert.conf
COPY ftps_keygen.sh ftps_keygen.sh
RUN chmod +x ftps_keygen.sh
RUN /bin/bash ftps_keygen.sh

# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/vsftpd.key -out /etc/ssl/certs/vsftpd.crt -subj "/C=SM/ST=somecountry/L=location/O=someorg/OU=somedept/CN=localhost"

COPY start_ftps.sh /bin/start_ftps.sh
COPY ftps.conf /etc/vsftpd/vsftpd.conf

EXPOSE 21 21000-21010
RUN chmod +x /bin/start_ftps.sh

ENTRYPOINT ["/bin/start_ftps.sh"]