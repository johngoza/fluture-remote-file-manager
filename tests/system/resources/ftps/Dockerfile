FROM alpine:3.10
RUN apk --no-cache add bash

# There is a known limitation where vsftpd does not support TLSv1.3 (as of 23 SEPT 2020)
# see https://forum.filezilla-project.org/viewtopic.php?t=50598 for more
RUN apk --no-cache add vsftpd && apk --no-cache add openssl

RUN adduser -h /home/./user -s /bin/false -D user

COPY ./ftps.conf /etc/vsftpd/vsftpd.conf
COPY ./hello.txt /home/user/hello.txt
COPY ./start_ftps.sh /bin/

EXPOSE 20 21 21000-21010
CMD ["start_ftps.sh"]
