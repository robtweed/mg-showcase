# fastify, stric, Bun, Node, Qoper8-cp + YottaDB

# MGateway Ltd
# 26 February 2024

FROM debian:bookworm

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y \
  build-essential \
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
  locales \
  python3 \
  procps \
  unzip

# Create app directory
RUN mkdir -p /opt/mgateway \
 && mkdir /opt/yottadb \
 && mkdir /opt/mgateway/m

WORKDIR /opt/mgateway
COPY ./files /opt/mgateway
COPY ./yottadb/files /opt/mgateway

RUN dos2unix * \
 && chmod +x /opt/mgateway/ydb \
 && chmod +x /opt/mgateway/ydb_run \
 && chmod +x /opt/mgateway/ydb_run_temp \
 && chmod +x /opt/mgateway/start \
 && chmod +x /opt/mgateway/stop_ydb \
 && chmod +x /opt/mgateway/stop_ydb_procs \
 && chmod +x /opt/mgateway/rundown \
 && chmod +x /opt/mgateway/g \
 && chmod +x /opt/mgateway/gd

RUN locale-gen "en_US.UTF-8"

RUN mkdir -p /var/www/html

# ===  Install Node.js & NPM

RUN echo "Installing NVM plus latest Node.js"

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
  && echo 'export NVM_DIR="$HOME/.nvm"' >> .bashrc \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> .bashrc \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && nvm install 20 \
  && npm install qoper8-fastify qoper8-stric glsdb mg-dbx-napi @fastify/static json5 \
  && npm install autocannon -g

# Install Bun

RUN curl -fsSL https://bun.sh/install | bash \
  && export BUN_INSTALL="$HOME/.bun" \
  && export PATH="$BUN_INSTALL/bin:$PATH"

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
  && rm ydb_run_temp

RUN updatedb

EXPOSE 8080

#ENTRYPOINT ["/bin/bash"]

ENTRYPOINT ./start && bash


