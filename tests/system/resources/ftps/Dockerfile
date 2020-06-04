FROM alpine:3.10
RUN apk --no-cache add bash
RUN apk --no-cache add vsftpd && apk --no-cache add openssl

RUN adduser -h /home/./user -s /bin/false -D user

COPY ftps.conf /etc/vsftpd/vsftpd.conf
COPY start_ftps.sh /bin/

EXPOSE 20 21 21000-21010
CMD ["start_ftps.sh"]
