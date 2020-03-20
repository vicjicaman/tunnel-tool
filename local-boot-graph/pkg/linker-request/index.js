import { request as graphRequest } from "graphql-request";
import * as Utils from "@nebulario/tunnel-utils";
//mport uuidv4 from 'uuid/v4'

export const request = async (url, query, variables, opts, cxt) => {
  //message: "request to http://localhost:9000/backend/graphql failed, reason: connect ECONNREFUSED 127.0.0.1:9000"
  //const requestid = uuidv4();
  let i = 0;
  let latestError = null;
  while (i++ < 3) {
    try {
      cxt.logger.debug("graphql.request", {
        url,
        query,
        variables
      });

      const res = await graphRequest(url, query, variables);
      return res;
    } catch (e) {
      latestError = e;
      const error = e.toString();
      cxt.logger.error("graphql.request.error", {
        url,
        query,
        variables,
        error
      });

      const retryError = error.includes("ECONNREFUSED");

      if (retryError) {
        cxt.logger.error("graphql.request.retry", {
          query,
          attempt: i
        });
        await Utils.Process.wait(2500);
      } else {
        throw e;
      }
    }
  }

  throw latestError;
};
