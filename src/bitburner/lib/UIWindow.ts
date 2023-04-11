import { NS } from 'bitburner/types/NetscriptDefinitions';
import * as actionMap from './Actions';

type BitburnerMessage = { uuid: string, action: string, params: string[] };

export class UIWindow {
  w: Window;
  netscript: NS;

  constructor(netscript: NS, w: Window) {
    this.netscript = netscript;
    this.w = w;
    this.w.addEventListener('bitburner', ({ detail }: CustomEvent) => this.messageHandler(detail));
    this.w.addEventListener('beforeunload', () => Promise.resolve().then(netscript.exit()));
    this.w.addEventListener('beforeunload', () => console.log('EXIT'));
    netscript.atExit(() => this.w.close());
    console.log(w);
    
  }

  async messageHandler(message: BitburnerMessage) {
    const { uuid, action, params } = message;
    console.log("RECIEVED", message);
    if (!action) return;

    const actionIndex = action
      .split('-')
      .map((string, index) => index != 0 ? string.charAt(0).toUpperCase() + string.slice(1) : string.toLowerCase())
      .join('');

    console.log(actionMap, actionIndex);

    if (Object.hasOwn(actionMap, actionIndex)) {
      const result = await actionMap[actionIndex as keyof typeof actionMap](this.netscript, params);
      this.sendResponse({
        uuid,
        action,
        data: result
      })
    }
  }

  sendResponse(response: { uuid: string; action: string; data: any; }) {
    this.w.dispatchEvent(new CustomEvent('bitburner-response', { detail: response }));
  }

}