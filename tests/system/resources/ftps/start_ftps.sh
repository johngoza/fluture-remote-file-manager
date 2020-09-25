#!/bin/sh
# set ftp user password
#echo "user:password" |/usr/sbin/chpasswd
#chown user:user /home/user/ -R

# Create (or clear) the log file
echo "Creating the logfile"
echo > /var/log/vsftpd.log

# We don't care about the certificate details. Just make sure we do have one
echo "Creating the certificate"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /etc/vsftpd/vsftpd.pem -out /etc/vsftpd/vsftpd.pem \
	-batch || { echo "Failed to create the vsftpd certificate"; exit 1; }


chmod 600 -R /etc/vsftpd
chmod 777 -R /home/user/

echo "Starting the vsftpd server"
/usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf || \
	{ echo "Failed to execute vsftpd"; exit 1; }
# todo: wrap this up so we can catch ctrl+c
# Off we go
exec tail -f /var/log/vsftpd.log
