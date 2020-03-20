import fs from "fs";

export const header = ({ paths: { resources: resourcesPath } }) => {
  return `<!DOCTYPE html>
    <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="${resourcesPath}/bootstrap/css/bootstrap.min.css"/>
          <link rel="stylesheet" href="${resourcesPath}/font-awesome/css/font-awesome.css"/>
          <link rel="stylesheet" href="${resourcesPath}/react-toastify/dist/ReactToastify.css"/>

          <title>Tunnel tool</title>
        </head>
        <body>
            <div id="root">
`;
};

export const footer = ({
  config,
  config: {
    paths: { base: basePath, resources: resourcesPath }
  },
  preloadedState,
  preloadedGraphState
}) => {
  let res = `
</div>`;
  res += `<script>
                // WARNING: See the following for security issues around embedding JSON in HTML!:
                // http://redux.js.org/docs/recipes/ServerRendering.html#security-considerations
                window.__CONFIG__ = ${JSON.stringify(config).replace(
                  /</g,
                  "\\u003c"
                )}
                window.__PRELOADED_STATE__ = ${JSON.stringify(
                  preloadedState
                ).replace(/</g, "\\u003c")}
                window.__APOLLO_STATE__ =  ${JSON.stringify(
                  preloadedGraphState
                ).replace(/</g, "\\u003c")}
            </script>
            <script language="javascript" src="${resourcesPath}/jquery/jquery.min.js"></script>
            <script language="javascript" src="${resourcesPath}/bootstrap/js/bootstrap.min.js"></script>
            <script src="${basePath}/app/index.js"></script>
        </body>
    </html>
`;
  return res;
};
