FROM alpine:3.10

ENV SSH_USER=user
ENV SSH_PASS=password
ENV ROOT_PASS=rootpassword

RUN apk add --no-cache bash openssh shadow
COPY ./id_rsa /etc/ssh/ssh_host_rsa_key
COPY ./id_rsa.pub ./.ssh/id_rsa.pub

RUN useradd -m -s /bin/bash $SSH_USER \
&& echo "$SSH_USER:$SSH_PASS" | chpasswd \
&& echo -e "$ROOT_PASS\n$ROOT_PASS" | passwd

ADD sshd.conf /etc/ssh/sshd_config

EXPOSE 22

CMD /usr/sbin/sshd -D