import { BitBurnerClient } from "./bitburner-ui-extension-server";
import { executeOnTerminal } from "./Terminal";
import { NS } from "./types/NetscriptDefinitions";


export function connect(netscript:NS, params:string[]) {
  if (params.length == 0) return;
  const command = params.reduce((prev, cur) => `${prev};connect ${cur}`, 'home');
  executeOnTerminal(command);
}

export function scanNetwork(netscript:NS) {
  const network = new Map();
  recursiveScan('home');
  BitBurnerClient.send([...network.values()]);

  function recursiveScan(server:string) {
    if (network.has(server)) return;
    const details = {
      connections: netscript.scan(server),
      ...netscript.getServer(server)
    }

    network.set(server, details);
    for (const connection of details.connections) {
      recursiveScan(connection);
    }
  }
}