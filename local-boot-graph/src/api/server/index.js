import { request } from "PKG/linker-request";

const SERVER_INFO = `mutation ServerInfo  {
  viewer {
    id
  }
}`;

export const info = async cxt => {
  const {
    instance: {
      network: {
        graph: { ip: host }
      }
    }
  } = cxt;

  const url = `http://${host}:9000/graphql`;
  cxt.logger.debug("server.info", {
    url
  });
  const res = await request(url, SERVER_INFO, {}, {}, cxt);

  const { viewer } = res;

  cxt.logger.debug("server.info.response", viewer);

  return viewer;
};
