FROM alpine:3.10
RUN apk --no-cache add vsftpd

COPY start_ftp.sh /bin/start_ftp.sh
COPY ftp.conf /etc/vsftpd/vsftpd.conf

EXPOSE 21 21000-21010
RUN chmod +x /bin/start_ftp.sh

ENTRYPOINT ["/bin/start_ftp.sh"]