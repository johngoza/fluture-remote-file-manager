FROM ubuntu:18.04

COPY ./vsftpd.userlist /etc/vsftpd/vsftpd.userlist
COPY ./hello.txt /home/user/hello.txt
COPY ./start_ftps.sh /bin/

RUN mkdir /var/run/vsftpd
RUN mkdir /var/run/vsftpd/empty

# There is a known limitation where vsftpd does not support TLSv1.3 (as of 23 SEPT 2020)
# see https://forum.filezilla-project.org/viewtopic.php?t=50598 for more
RUN apt-get update
RUN apt-get install -y vsftpd && apt-get install -y openssl

COPY ./ftps.conf /etc/vsftpd/vsftpd.conf

RUN useradd -rm -d /home/user -s /bin/bash -g root user
RUN echo user:password | chpasswd

EXPOSE 20 21 21000-21010
CMD ["start_ftps.sh"]
