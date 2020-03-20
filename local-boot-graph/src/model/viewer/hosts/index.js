import fs from "fs";
import path from "path";

const MANAGED_COMMENT = "#repoflow-linker-entry";
const HOSTS_FILE_PATH = "/etc/hosts";

const isIP = ip => {
  if (typeof ip !== "string") return false;
  if (!ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
    return false;
  }
  return (
    ip.split(".").filter(octect => octect >= 0 && octect <= 255).length === 4
  );
};

const getHostsEntries = () => {
  const hostsContent = fs.readFileSync(HOSTS_FILE_PATH).toString();
  const lines = hostsContent.split("\n");

  const index = {};
  const entries = lines
    .map(line => {
      const values = line.trim().split(/\s+/);
      const curr = {
        id: values[1],
        host: values[1],
        ip: values[0],
        managed: values[2] === MANAGED_COMMENT
      };

      index[curr.host] = curr;
      return curr;
    })
    .filter(entry => entry.host && isIP(entry.ip));

  return { entries, index };
};

const readable = cxt => {
  try {
    fs.accessSync(HOSTS_FILE_PATH, fs.constants.R_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const writable = cxt => {
  try {
    fs.accessSync(HOSTS_FILE_PATH, fs.constants.W_OK);
    return true;
  } catch (e) {
    return false;
  }
};

export const status = async cxt => {
  return {
    writable: writable(cxt),
    readable: readable(cxt)
  };
};

export const list = async (host, cxt) => {
  const { entries } = getHostsEntries(cxt);
  return entries;
};

export const get = async (host, cxt) => {
  const { index } = getHostsEntries(cxt);
  return index[host.trim()] || null;
};

export const add = async ({ host, ip }, cxt) => {
  const isWritable = writable(cxt);

  if (!isWritable) {
    cxt.logger.debug("hosts.add.noaccess");
    return null;
  }

  const current = await get(host);
  cxt.logger.debug("hosts.add.compare", { current, ip });

  if (current && current === ip) {
    return current;
  }

  try {
    await remove({ host }, cxt);
    fs.appendFileSync(HOSTS_FILE_PATH, `${ip} ${host} ${MANAGED_COMMENT}\n`);
    return await get(host);
  } catch (e) {
    cxt.logger.error("hosts.add.error", { error: e.toString() });
    return null;
  }
};

export const remove = async ({ host }, cxt) => {
  const isWritable = writable(cxt);

  if (!isWritable) {
    cxt.logger.debug("hosts.remove.noaccess");
    return null;
  }

  const hostsContent = fs.readFileSync(HOSTS_FILE_PATH).toString();

  const lines = hostsContent.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.trim().split(/\s+/);
    if (values[1] === host) {
      lines.splice(i, 1);
    }
  }

  fs.writeFileSync(HOSTS_FILE_PATH, lines.join("\n"));
  return true;
};
