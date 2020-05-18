#!/bin/sh

#Remove all ftp users
grep '/ftp/' /etc/passwd | cut -d':' -f1 | xargs -n1 deluser

#Default user 'user' with password 'password'
USERS="user|password"


NAME=$(echo $USERS | cut -d'|' -f1)
PASS=$(echo $USERS | cut -d'|' -f2)
FOLDER=$(echo $USERS | cut -d'|' -f3)
UID=$(echo $USERS | cut -d'|' -f4)

if [ -z "$FOLDER" ]; then
  FOLDER="/ftp/$NAME"
fi

if [ ! -z "$UID" ]; then
  UID_OPT="-u $UID"
fi

echo -e "$PASS\n$PASS" | adduser -h $FOLDER -s /sbin/nologin $UID_OPT $NAME
mkdir -p $FOLDER
chown $NAME:$NAME $FOLDER
unset NAME PASS FOLDER UID

MIN_PORT=21000
MAX_PORT=21010
ADDR_OPT="-opasv_address=$ADDRESS"

# Used to run custom commands inside container
if [ ! -z "$1" ]; then
  exec "$@"
else
  exec /usr/sbin/vsftpd -opasv_min_port=$MIN_PORT -opasv_max_port=$MAX_PORT $ADDR_OPT /etc/vsftpd/vsftpd.conf
fi