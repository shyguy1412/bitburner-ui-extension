import { NS } from 'bitburner/types/NetscriptDefinitions';
import * as actionMap from './Actions';

type BitburnerMessage = { uuid: string, action: string, params: string[] };

export class UIWindow {
  // w: Element;
  netscript: NS;

  constructor(netscript: NS, w: Element) {
    this.netscript = netscript;
    // this.w = w;
    const listener = ({ detail }: CustomEvent) => this.messageHandler(detail);
    window.addEventListener('bitburner', listener);
    // this.w.addEventListener('beforeunload', () => Promise.resolve().then(netscript.exit()));
    // this.w.addEventListener('beforeunload', () => console.log('EXIT'));
    netscript.atExit(() => window.removeEventListener('bitburner', listener));
    // console.log(w);
  }

  async messageHandler(message: BitburnerMessage) {
    const { uuid, action, params } = message;
    // console.log("RECIEVED", message);
    if (!action) return;

    const actionIndex = action
      .split('-')
      .map((string, index) => index != 0 ? string.charAt(0).toUpperCase() + string.slice(1) : string.toLowerCase())
      .join('');

    // console.log({actionMap, actionIndex});

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
    window.dispatchEvent(new CustomEvent('bitburner-response', { detail: response }));
  }

}