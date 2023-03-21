import { BitBurnerSocket } from "lib/BitBurnerSocket";
import { NS } from "./types/NetscriptDefinitions";
import * as actionMap from './Actions';

export const BitBurnerClient = new BitBurnerSocket('bitburner');

export function main(netscript: NS) {
  BitBurnerClient.once('open', () => {
    netscript.tprint('Connection Established');
  })

  BitBurnerClient.on('message', async (message) => {
    const { uuid, action, params } = JSON.parse(message.data) as { uuid:string, action: string, params: string[] };
    console.log(message);
    if (!action) return;

    const actionIndex = action
      .split('-')
      .map((string, index) => index != 0 ? string.charAt(0).toUpperCase() + string.slice(1) : string.toLowerCase())
      .join('');

    console.log(actionMap, actionIndex);


    if (Object.hasOwn(actionMap, actionIndex)) {
      const result = await actionMap[actionIndex as keyof typeof actionMap](netscript, params);
      BitBurnerClient.send({
        uuid,
        action,
        data: result
      })
    }
  })

  netscript.atExit(() => BitBurnerClient.close());
  BitBurnerClient.once('close', () => netscript.exit());

  return new Promise(resolve => { });
}