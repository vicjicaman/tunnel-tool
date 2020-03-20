import { execSync } from "child_process";

export const getNameserver = () => {
  const hostsRegex = new RegExp(/nameserver (.+)/, "gm");
  const hosts = execSync(`cat /etc/resolv.conf`).toString();

  const match = hostsRegex.exec(hosts);
  if (!match) {
    return null;
  }

  return match[1];
};

export const getHostname = (host, nameserver) => {
  const lupRegex = new RegExp(/Address 1:\s+([^\s]+)/, "g");
  const lup = execSync(`nslookup ${host} ${nameserver}`).toString();

  const lups = lup.substr(lup.indexOf(host))

  const match = lupRegex.exec(lups);
  if (!match) {
    return null;
  }

  return match[1];
};
