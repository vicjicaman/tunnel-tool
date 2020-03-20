import React from "react";
import { renderToNodeStream, renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ApolloProvider, getDataFromTree } from "react-apollo";
import * as Template from "./template";

import fetch from "node-fetch";
import { ApolloClient } from "apollo-boost";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import { routerMiddleware } from "connected-react-router";
const createMemoryHistory = require("history").createMemoryHistory;

export const render = (
  {
    App,
    paths: { resources: RESOURCES_BASE_ROUTE, base: BASE_ROUTE },
    urls: {
      external: { graphql: EXTERNAL_URL_GRAPH, events: EXTERNAL_URL_EVENTS },
      internal: { graphql: INTERNAL_URL_GRAPH, events: INTERNAL_URL_EVENTS }
    },
    watchers,
    reducers,
    req,
    res
  },
  cxt
) => {
  let routerContext = {};
  const { store } = configureStore({ reducers, initState: {} });
  const { graph } = configureGraph({
    url: INTERNAL_URL_GRAPH,
    req,
    initState: {}
  });

  const AppRoot = (
    <ApolloProvider client={graph}>
      <Provider store={store}>
        <StaticRouter location={req.url} context={routerContext}>
          <App />
        </StaticRouter>
      </Provider>
    </ApolloProvider>
  );

  getDataFromTree(AppRoot)
    .then(() => {
      const preloadedState = store.getState();
      const htmlSteam =
        Template.header({
          paths: { base: BASE_ROUTE, resources: RESOURCES_BASE_ROUTE }
        }) +
        renderToString(AppRoot) +
        Template.footer({
          config: {
            paths: { base: BASE_ROUTE, resources: RESOURCES_BASE_ROUTE },
            urls: {
              graphql: EXTERNAL_URL_GRAPH,
              events: EXTERNAL_URL_EVENTS
            }
          },
          preloadedState,
          preloadedGraphState: graph.extract()
        });

      if (routerContext.url) {
        res.redirect(routerContext.url);
      } else {
        res.status(200);
        res.send(htmlSteam);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
};

const configureGraph = ({ url, req }) => ({
  graph: new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: url,
      onError: e => {
        console.log("APOLLO_CLIENT_ERROR");
        console.log(e.graphQLErrors);
      },
      credentials: "include",
      fetch: fetch,
      headers: {
        cookie: req.header("Cookie")
      }
    }),
    cache: new InMemoryCache()
  })
});

const configureStore = ({ reducers, initialState }) => {
  const reduxMiddlewares = [routerMiddleware(createMemoryHistory())];

  const store = createStore(
    combineReducers({ app: reducers }),
    initialState,
    compose(applyMiddleware(...reduxMiddlewares))
  );

  return { store };
};
