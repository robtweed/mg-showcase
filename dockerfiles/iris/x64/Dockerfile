# MGateway Ltd
# 5 April 2024

# Version 2.6

FROM containers.intersystems.com/intersystems/iris-community:2023.3

RUN echo "Building mg-showcase Container Version 2.6"

USER root

WORKDIR /home/irisowner

# Add some useful and required utilities

RUN apt update && apt install -y \
  wget \
  curl \
  locate \
  nano \
  unzip \
  build-essential \
  make \
  gcc \
  dos2unix \
  libssl-dev \
  libicu-dev \
  libpcre3-dev \
  zlib1g-dev \
  libgd-dev \
  python3 \
  procps \
  apache2-utils \
  git

RUN mkdir /opt/mg_web \
  && chown irisowner:irisowner /opt/mg_web

USER irisowner

# Get mg-web

RUN echo 'Install nginx and mg_web'

RUN git clone https://github.com/chrisemunt/mg_web  \
 && cp /home/irisowner/mg_web/src/*.h /opt/mg_web \
 && cp /home/irisowner/mg_web/src/*.c /opt/mg_web \
 && cp /home/irisowner/mg_web/src/nginx/* /opt/mg_web \
 && cd /opt/mg_web \
 && dos2unix *

# Copy the benchmark test scripts into the Container

COPY ./dockerfiles/files /home/irisowner
COPY ./dockerfiles/iris/files /home/irisowner

USER root

RUN cd /home/irisowner \
  && chown irisowner:irisowner *.js \
  && chown irisowner:irisowner *.mjs \
  && chown irisowner:irisowner *.txt \
  && chown irisowner:irisowner mgweb.* \
  && chown irisowner:irisowner startmgwebnode \
  && chown -R irisowner:irisowner www \
  && chmod +x startmgwebnode \
  && chmod +x nginx \
  && chmod +x g \
  && chmod +x gd \
  && dos2unix *

RUN cd /opt \
  && wget https://nginx.org/download/nginx-1.25.4.tar.gz \
  && tar zxf nginx-1.25.4.tar.gz \
  && cd nginx-1.25.4 \
  && CFLAGS=-Wno-error ./configure --prefix=/var/www/html --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --http-log-path=/var/log/nginx/access.log --error-log-path=/var/log/nginx/error.log --with-pcre --lock-path=/var/lock/nginx.lock --pid-path=/var/run/nginx.pid --with-http_ssl_module --with-http_image_filter_module=dynamic --modules-path=/etc/nginx/modules --with-http_v2_module --with-stream=dynamic --with-http_addition_module --with-http_mp4_module --with-threads --add-module=/opt/mg_web \
  && make \
  && make install

RUN mv /home/irisowner/nginx.conf /etc/nginx

RUN cd /etc \
  && chown -R irisowner:irisowner nginx

RUN cd /var/log \
  && chown -R irisowner:irisowner nginx

RUN cd /var \
  && chown -R irisowner:irisowner www

USER irisowner

# Install Node.js v 20 using NVM

RUN echo 'Install Node.js and Bun.js'

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
  && echo 'export NVM_DIR="$HOME/.nvm"' >> .bashrc \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> .bashrc \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && export NVM_DIR="$HOME/.nvm"  >> .bashrc \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  >> .bashrc \
  && nvm install 20 \
  && npm install qoper8-fastify mg-bun-router glsdb mg-dbx-napi @fastify/static mgw-router mg_web_js json5 redis \
  && npm install autocannon -g \
  && cp -r /usr/irissys/dev/nodejs/* /home/irisowner/node_modules

# Install Bun.js

RUN curl -fsSL https://bun.sh/install | bash \
  && export BUN_INSTALL="$HOME/.bun" \
  && export PATH="$BUN_INSTALL/bin:$PATH" \
  && echo 'export BUN_INSTALL="$HOME/.bun"' >> .bashrc \
  && echo 'export PATH=$BUN_INSTALL/bin:$PATH' >> .bashrc \
  && echo "Installed Bun version:" \
  && bun -v

USER root

# Install Redis

RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list \
  && apt update \
  && apt install -y redis \
  && redis-server --daemonize yes \
  && update-rc.d redis-server defaults

RUN cd /opt \
  && git clone https://github.com/chrisemunt/mgsi

# Change the IRIS system password to secret

RUN sed -i 's/PasswordHash=/PasswordHash=2d23c9271a8c4cfbf12abb4553be2817d617a457ab8ccbfceba0fb832ef29c67263fd56f0b6c3bea6f14a675cb5daf921d559bcee0d60b5bb17385b5d0c749b7,8b17803718974c72d35b3d4236d418160145b42a8a2725f5c1c2553dc7df01ae54afd8a17fd5f06401bba850577d32cb807e5034f5bbead49be883604b06444e,10000,SHA512/g' /usr/irissys/iris.cpf

RUN sed -i 's?#!/bin/bash?#!/bin/bash\nredis-server --daemonize yes\n/home/irisowner/nginx start?' /home/irisowner/irissys/startISCAgent.sh

RUN rm -r /opt/nginx-1.25.4/ \
  && rm /opt/nginx-1.25.4.tar.gz

RUN updatedb

USER irisowner

# Enable the %System_Callin interface, load mgsi routines and start superserver

RUN iris start IRIS quietly && \
  /bin/echo -e \
    "do ##class(Security.Services).Get(\"%Service_CallIn\",.prop)\n" \
    "set prop(\"Enabled\")=1\n" \
    "do ##class(Security.Services).Modify(\"%Service_CallIn\",.prop)\n" \
    "do ##class(%SYSTEM.OBJ).Load(\"/opt/mgsi/isc/zmgsi_isc.ro\",\"ck\")\n" \
    "d start^%zmgsi(7042)\n" \
    "halt" \
  | iris session IRIS -U %SYS && \
  iris stop IRIS quietly

EXPOSE 8080
EXPOSE 7042
EXPOSE 3000



