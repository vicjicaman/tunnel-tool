import { execSync } from "child_process";
import * as Utils from "@nebulario/tunnel-utils";
import fs from "fs";

const JSON_OUTPUT = "-o json";

export const kubectl = async (cmd, opts, cxt) => {
  const {
    config,
    namespace,
    input = null,
    limit = 2,
    output = JSON_OUTPUT
  } = opts;

  let currLimit = limit;
  let i = 0;
  while (i < currLimit) {
    ++i;
    try {
      const buildCmd = `${cmd} ${namespace ? ` -n ${namespace} ` : ""}`;
      cxt.logger.debug("kubectl.cmd", { cmd: buildCmd, attempt: i });
      const stdout = execSync(
        (input !== null ? `echo '${input}' | ` : "") +
          `kubectl ${buildCmd} ${output ? output : ""} ${
            config ? ` --kubeconfig=${config} ` : ""
          }`
      );

      if (output === null) {
        return stdout;
      }

      if (output === JSON_OUTPUT) {
        return JSON.parse(stdout);
      } else {
        return stdout.toString();
      }
    } catch (e) {
      const error = e.toString();
      cxt.logger.error("kubectl.error", { error });
      if (i >= currLimit) {
        throw e;
      }

      if (error.includes("was refused")) {
        currLimit = 5;
        await Utils.Process.wait(1000);
        cxt.logger.debug("kubectl.error.retry.refuse", { attempt: i });
      } else {
        await Utils.Process.wait(100);
        cxt.logger.debug("kubectl.error.retry", { attempt: i });
      }
    }
  }
};

export const init = async (name, namespace, cxt) => {
  const config = {
    path: `/home/node/.kube/${name}.config`,
    context: "default",
    user: "handler",
    host: "https://kubernetes.default.svc.cluster.local",
    ca: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
    token: fs.readFileSync(
      "/var/run/secrets/kubernetes.io/serviceaccount/token"
    )
  };

  execSync(
    `kubectl config --kubeconfig=${config.path} set-cluster ${name} --server=${config.host} --certificate-authority=${config.ca}`
  );

  execSync(
    `kubectl config --kubeconfig=${config.path} set-credentials ${config.user} --token=${config.token}`
  );
  execSync(
    `kubectl config --kubeconfig=${config.path} set-context ${config.context} --cluster=${name} --namespace=${namespace} --user=${config.user}`
  );
  execSync(
    `kubectl config --kubeconfig=${config.path} use-context ${config.context}`
  );

  return config;
};
