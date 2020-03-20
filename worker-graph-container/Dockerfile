FROM node:12.13.0-alpine

RUN apk --update add --no-cache openssh curl
RUN /usr/bin/ssh-keygen -A

RUN chown -R node /etc/ssh/
RUN sed -i -e 's/AllowTcpForwarding.*/AllowTcpForwarding yes/' /etc/ssh/sshd_config
RUN sed -i -e 's/GatewayPorts.*/GatewayPorts yes/' /etc/ssh/sshd_config
RUN sed -i -e 's/#ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
RUN sed -i -e 's/#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
RUN sed -i -e 's/#UsePAM.*/UsePAM no/' /etc/ssh/sshd_config
RUN sed -i -e 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

ENV ENV_ROOT=/env
RUN mkdir ${ENV_ROOT}
RUN chown node ${ENV_ROOT}

ENV CONTAINER=tunnel-server-worker-graph-container
ENV SOURCE=tunnel-server-worker-graph

ENV APP_ROOT=/env/${CONTAINER}/dist
ENV APP_HOME=${APP_ROOT}/node_modules/@nebulario/${SOURCE}

ARG CACHEBUST=1
RUN echo "CACHE $CACHEBUST"

RUN mkdir -p ${APP_HOME}
COPY --chown=node:node ./dist ${APP_ROOT}
RUN chown -R node ${APP_HOME}

USER node

WORKDIR ${APP_HOME}
ENTRYPOINT ["node"]
CMD ["dist/index.js"]
