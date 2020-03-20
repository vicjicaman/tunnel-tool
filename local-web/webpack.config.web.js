const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const path = require("path");
const { WatchRunPlugin } = require("./webpack.config.common");

module.exports = (env = {}) => {
  const __DEV__ = env.development;
  const __PROD__ = env.production;
  const plugins = [new WatchRunPlugin("web")];

  if (__PROD__) {
    plugins.push(new UglifyJSPlugin());
  }

  return {
    entry: "./src/web/index.js",
    output: {
      path: path.join(__dirname, "/dist/web"),
      filename: "index.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader"
        }
      ]
    },
    plugins,
    resolve: {
      alias: {
        Comps: path.resolve(__dirname, "src/common/comps"),
        Root: path.resolve(__dirname, "src/common/root"),
        Actions: path.resolve(__dirname, "src/common/actions"),
        UI: path.resolve(__dirname, "src/common/ui"),
        PKG: path.resolve(__dirname, "pkg"),
        Queries: path.resolve(__dirname, "src/common/queries"),
        Fragments: path.resolve(__dirname, "src/common/fragments")
      },
      modules: [path.resolve(__dirname, "src"), "node_modules"],
      extensions: [".js", ".jsx", ".json"]
    }
  };
};
