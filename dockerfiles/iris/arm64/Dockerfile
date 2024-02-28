# MGateway Ltd
# 26 February 2024

FROM containers.intersystems.com/intersystems/iris-community:2023.3-linux-arm64

USER root

WORKDIR /home/irisowner

# Add some useful and required utilities

RUN apt update && apt install -y \
  wget \
  curl \
  locate \
  nano \
  unzip \
  git

USER irisowner

# Install Node.js v 20 using NVM

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
  && echo 'export NVM_DIR="$HOME/.nvm"' >> .bashrc \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> .bashrc \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && nvm install 20 \
  && npm install qoper8-fastify qoper8-stric glsdb mg-dbx-napi @fastify/static json5 \
  && npm install autocannon -g \
  && cp -r /usr/irissys/dev/nodejs/* node_modules

# Install Bun.js

RUN curl -fsSL https://bun.sh/install | bash \
  && export BUN_INSTALL="$HOME/.bun" \
  && export PATH="$BUN_INSTALL/bin:$PATH" \
  && echo 'export BUN_INSTALL="$HOME/.bun"' >> .bashrc \
  && echo 'export PATH=$BUN_INSTALL/bin:$PATH' >> .bashrc \
  && echo "Installed Bun version:" \
  && bun -v


USER root

RUN cd /opt \
  && git clone https://github.com/chrisemunt/mgsi

# Copy the benchmark test scripts into the Container

COPY ./files /home/irisowner
COPY ./iris/files /home/irisowner

RUN chown irisowner:irisowner *.js \
  && chown irisowner:irisowner *.mjs \
  && chown irisowner:irisowner *.txt \
  && chown -R irisowner:irisowner www \
  && chmod +x g \
  && chmod +x gd

# Change the IRIS system password to secret

RUN sed -i 's/PasswordHash=/PasswordHash=2d23c9271a8c4cfbf12abb4553be2817d617a457ab8ccbfceba0fb832ef29c67263fd56f0b6c3bea6f14a675cb5daf921d559bcee0d60b5bb17385b5d0c749b7,8b17803718974c72d35b3d4236d418160145b42a8a2725f5c1c2553dc7df01ae54afd8a17fd5f06401bba850577d32cb807e5034f5bbead49be883604b06444e,10000,SHA512/g' /usr/irissys/iris.cpf

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
