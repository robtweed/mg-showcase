# MGateway Ltd
# 20 March 2024

# Version 2.1

FROM debian:bookworm

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y \
  build-essential \
  make \
  gcc \
  curl \
  git \
  wget \
  dos2unix \
  locate \
  nano \
  xinetd \
  file  \
  libtinfo5 \
  lsb-release \
  lsof \
  libelf1 \
  pkg-config \
  libelf-dev \
  libicu-dev \
  libssl-dev \
  libicu-dev \
  libpcre3-dev \
  zlib1g-dev \
  libgd-dev \
  locales \
  pkg-config \
  file \
  python3 \
  procps \
  apache2-utils \
  unzip

# Create app directory
RUN mkdir -p /opt/mgateway \
 && mkdir /opt/yottadb \
 && mkdir /opt/mg_web  \
 && mkdir /opt/mgateway/m

WORKDIR /opt/mgateway
COPY ./dockerfiles/files /opt/mgateway
COPY ./dockerfiles/yottadb/files /opt/mgateway

RUN locale-gen "en_US.UTF-8"

RUN mkdir -p /var/www/html

# Get mg-web

RUN echo 'Install nginx'

RUN git clone https://github.com/chrisemunt/mg_web  \
 && cp /opt/mgateway/mg_web/src/*.h /opt/mg_web \
 && cp /opt/mgateway/mg_web/src/*.c /opt/mg_web \
 && cp /opt/mgateway/mg_web/src/nginx/* /opt/mg_web \
 && cp /opt/mgateway/mg_web/experimental/mg_web_node.mjs /opt/mgateway \
 && cd /opt/mg_web \
 && dos2unix *

RUN cd /opt/mgateway \
 && dos2unix * \
 && chmod +x ydb \
 && chmod +x ydb_run \
 && chmod +x ydb_run_temp \
 && chmod +x start \
 && chmod +x stop_ydb \
 && chmod +x stop_ydb_procs \
 && chmod +x rundown \
 && chmod +x startmgwebnode \
 && chmod +x nginx \
 && chmod +x install_nodem \
 && chmod +x g \
 && chmod +x gd

RUN cd /opt \
  && wget https://nginx.org/download/nginx-1.25.4.tar.gz \
  && tar zxf nginx-1.25.4.tar.gz \
  && cd nginx-1.25.4 \
  && CFLAGS=-Wno-error ./configure --prefix=/var/www/html --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --http-log-path=/var/log/nginx/access.log --error-log-path=/var/log/nginx/error.log --with-pcre --lock-path=/var/lock/nginx.lock --pid-path=/var/run/nginx.pid --with-http_ssl_module --with-http_image_filter_module=dynamic --modules-path=/etc/nginx/modules --with-http_v2_module --with-stream=dynamic --with-http_addition_module --with-http_mp4_module --with-threads --add-module=/opt/mg_web \
  && make \
  && make install

RUN mv /opt/mgateway/nginx.conf /etc/nginx

# ===  Install Node.js & NPM

RUN echo "Installing NVM plus latest Node.js"

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
  && echo 'export NVM_DIR="$HOME/.nvm"' >> .bashrc \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> .bashrc \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && nvm install 20 \
  && npm install qoper8-fastify qoper8-stric glsdb mg-dbx-napi @fastify/static mgw-router json5 redis \
  && npm install autocannon -g

# Install Bun

RUN curl -fsSL https://bun.sh/install | bash \
  && export BUN_INSTALL="$HOME/.bun" \
  && export PATH="$BUN_INSTALL/bin:$PATH" \
  && echo "Installed Bun version:" \
  && bun -v

RUN echo "Installing YottaDB..."

RUN mkdir /tmp/tmp \
  && wget -P /tmp/tmp https://gitlab.com/YottaDB/DB/YDB/raw/master/sr_unix/ydbinstall.sh \
  && cd /tmp/tmp \
  && chmod +x ydbinstall.sh \
  && ./ydbinstall.sh --utf8 default --verbose --force-install r1.38 \
  && export ydb_gbldir=/opt/yottadb/yottadb.gld \
  && /usr/local/lib/yottadb/r138/mumps -run ^GDE < /opt/mgateway/gde.txt \
  && /usr/local/lib/yottadb/r138/mupip create \
  && /usr/local/lib/yottadb/r138/mupip extend -blocks=48000 DEFAULT

RUN ./install_nodem \
  && cp /opt/mgateway/node_modules/nodem/src/v4wNode.m /opt/mgateway/m

# Install Redis

RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list \
  && apt update \
  && apt install -y redis \
  && redis-server --daemonize yes \
  && update-rc.d redis-server defaults

# Install and configure the network mgsi interface code to allow
# network access to YottaDB (default setup uses
# API access to YottaDB)

RUN git clone https://github.com/chrisemunt/mgsi /opt/mgateway/mgsi \
  && cp /opt/mgateway/mgsi/yottadb/* /opt/mgateway/m \
  && /opt/mgateway/ydb_run_temp ylink^%zmgsi \
  && cp /opt/mgateway/mgsi/unix/zmgsi.ci /usr/local/lib/yottadb/r138
  #&& rm -r /opt/mgateway/mgsi

RUN cp /opt/mgateway/mgsi/unix/zmgsi_ydb /usr/local/lib/yottadb/r138 \
  && cp /opt/mgateway/mgsi/unix/zmgsi_xinetd /etc/xinetd.d/zmgsi_xinetd \
  && cp /opt/mgateway/mgsi/unix/zmgsi.ci /usr/local/lib/yottadb/r138 \
  && sed -i 's/130/138/g' /etc/xinetd.d/zmgsi_xinetd \
  && sed -i 's/130/138/g' /usr/local/lib/yottadb/r138/zmgsi_ydb \
  && sed -i 's/1.30/1.38/g' /usr/local/lib/yottadb/r138/zmgsi_ydb \
  && echo "zmgsi_xinetd          7041/tcp                        # zmgsi" >> /etc/services \
  && rm -r /opt/mgateway/mgsi

# Clean up

RUN cd /opt/mgateway \
  && rm gde.txt \
  && rm ydb_run_temp \
  && rm -r /opt/nginx-1.25.4/ \
  && rm /opt/nginx-1.25.4.tar.gz

RUN updatedb

EXPOSE 8080
EXPOSE 3000
EXPOSE 7042

#ENTRYPOINT ["/bin/bash"]

ENTRYPOINT ./start && bash


