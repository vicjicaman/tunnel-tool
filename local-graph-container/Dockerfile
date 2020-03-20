FROM node:12.13.0-alpine

RUN apk --update add --no-cache openssh-client curl

ENV ENV_ROOT=/env
RUN mkdir ${ENV_ROOT}
RUN chown node ${ENV_ROOT}

ENV CONTAINER=tunnel-local-graph-container
ENV SOURCE=tunnel-local-graph

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
