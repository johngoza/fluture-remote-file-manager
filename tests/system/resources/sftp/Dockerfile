FROM alpine:3.10

ENV SSH_USER=user
ENV SSH_PASS=password
ENV ROOT_PASS=rootpassword

RUN apk add --no-cache bash openssh shadow
COPY ./host_id_rsa /etc/ssh/ssh_host_rsa_key

RUN useradd -m -s /bin/bash $SSH_USER \
&& echo "$SSH_USER:$SSH_PASS" | chpasswd \
&& echo -e "$ROOT_PASS\n$ROOT_PASS" | passwd

COPY ./host_id_rsa.pub /home/user/.ssh/keys/id_rsa.pub
RUN cat /home/user/.ssh/keys/id_rsa.pub > /home/user/.ssh/authorized_keys
RUN chmod -R 700 /home/user/.ssh && chown -R user /home/user/.ssh

COPY sftp.conf /etc/ssh/sshd_config

EXPOSE 22

CMD /usr/sbin/sshd -D