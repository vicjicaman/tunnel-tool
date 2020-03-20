import React, { Component } from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { ApolloProvider } from "react-apollo";
import { ApolloConsumer } from "react-apollo";
import { ToastContainer } from "react-toastify";

import { ApolloClient } from "apollo-boost";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import createHistory from "history/createBrowserHistory";
import {
  ConnectedRouter,
  connectRouter,
  routerMiddleware
} from "connected-react-router";
import socketIOClient from "socket.io-client";

import * as DeviceQueries from "Queries/device";

class SocketContainer extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    const { client, events } = this.props;

    const socket = socketIOClient(events);
    socket.on("server.init", data => {
      socket.emit("client.init");
    });

    socket.on("client.update", data => {
      console.log("UPDATE DEVICES");
      client.query({
        fetchPolicy: "network-only",
        query: DeviceQueries.List
      });
    });
  }

  render() {
    return null;
  }
}

export const render = ({
  App,
  watchers,
  reducers,
  urls: { graphql, events }
}) => {
  const { store, history } = configureStore({
    reducers,
    initState: window.__PRELOADED_STATE__
  });
  const client = configureGraph({
    url: graphql,
    initState: window.__APOLLO_STATE__
  });

  const AppRoot = () => {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <App />
          </ConnectedRouter>
        </Provider>
        <ToastContainer />
        <SocketContainer client={client} events={events} />
      </ApolloProvider>
    );
  };

  hydrate(<AppRoot />, document.getElementById("root"));
};

const configureGraph = ({ url, initState }) => {
  return new ApolloClient({
    cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
    link: new HttpLink({ uri: url })
  });
};

const configureStore = ({ reducers, initialState }) => {
  const history = createHistory();

  // Allow the passed state to be garbage-collected
  //delete window.__PRELOADED_STATE__;
  const store = createStore(
    /***/
    combineReducers({ router: connectRouter(history), app: reducers }),
    initialState,
    /**/
    compose(
      applyMiddleware(routerMiddleware(history)),
      /**/
      typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== "undefined"
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : f => f
    )
  );

  return { store, history };
};
