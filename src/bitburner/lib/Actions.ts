import { executeOnTerminal } from "./Terminal";
import { NS } from "../types/NetscriptDefinitions";


export function connect(netscript: NS, params: string[]) {
  const command = params.reduce((prev, cur) => `${prev};connect ${cur}`, 'home');
  executeOnTerminal(command);
}

export function scanNetwork(netscript: NS) {
  const network = new Map();
  recursiveScan('home');
  // BitBurnerClient.send([...network.values()]);

  function recursiveScan(server: string) {
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

  return [...network.values()];
}

export async function nsFunction(netscript: NS, params: string[]):Promise<any> {
  const [functionWithNamespaces, ...functionParams] = params;
  let targetFunction:any = netscript;

  for (const key of functionWithNamespaces.split('.')) {
    if (Object.hasOwn(targetFunction, key))
      targetFunction = targetFunction[key];
  }
  
  return await targetFunction(...functionParams);
}