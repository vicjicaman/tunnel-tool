import React from "react";
import ReactDOM from "react-dom";
import App from "../common/App.js";
import { render } from "./render.js";
import { reducers, watchers } from "../common/state";

const {
  urls: { graphql, events }
} = window.__CONFIG__;

render({
  App,
  watchers,
  reducers,
  urls: {
    graphql,
    events
  }
});
