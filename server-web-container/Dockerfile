FROM node:12.13.0-alpine

ENV ENV_ROOT=/env
RUN mkdir ${ENV_ROOT}
RUN chown node ${ENV_ROOT}

ENV CONTAINER=tunnel-server-web-container
ENV SOURCE=tunnel-server-web

ENV APP_ROOT=/env/${CONTAINER}/dist
ENV APP_ROOT_SOURCE=/env/${SOURCE}
ENV APP_HOME=${APP_ROOT}/node_modules/@nebulario/${SOURCE}

ARG CACHEBUST=1
RUN echo "CACHE $CACHEBUST"

RUN mkdir -p ${APP_HOME}
RUN mkdir -p ${APP_ROOT_SOURCE}
COPY --chown=node:node ./dist ${APP_ROOT}
RUN chown -R node ${APP_HOME}

RUN ln -s ${APP_ROOT}/node_modules ${APP_HOME}/node_modules

USER node

WORKDIR ${APP_HOME}
ENTRYPOINT ["node"]
CMD ["dist/index.js"]
