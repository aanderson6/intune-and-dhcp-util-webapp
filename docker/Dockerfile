FROM httpd:latest

RUN apt update
RUN apt install libapache2-mod-wsgi-py3 -y
RUN apt install python3-pip -y
RUN apt install openssh-client -y

COPY util.conf /usr/local/apache2/conf/sites/util.conf
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

ADD ./build-deploy /var/www/util
RUN chown www-data:www-data /var/www/util/dhcp-ssh/key
RUN chmod 600 /var/www/util/dhcp-ssh/key
RUN chown www-data:www-data /var/www/util/dhcp-ssh/getdhcp.sh
RUN chmod 700 /var/www/util/dhcp-ssh/getdhcp.sh

RUN python3 -m pip install -r /var/www/util/requirements.txt

EXPOSE 10001
