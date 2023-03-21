import { v4 } from "uuid";
import { BitBurnerSocket } from "../../lib/BitBurnerSocket";

type NetworkData = BitburnerServer[]

type BitburnerServer = {
  connections: string[],
  contracts: any[],
  cpuCores: number,
  ftpPortOpen: boolean,
  hasAdminRights: boolean,
  hostname: string,
  httpPortOpen: boolean,
  ip: string,
  isConnectedTo: boolean,
  maxRam: number,
  messages: any[],
  organizationName: string,
  programs: any[],
  ramUsed: number,
  runningScripts: string[],
  scripts: string[],
  serversOnNetwork: any[],
  smtpPortOpen: boolean,
  sqlPortOpen: boolean,
  sshPortOpen: boolean,
  textFiles: string[],
  purchasedByPlayer: boolean,
  backdoorInstalled: boolean,
  baseDifficulty: number,
  hackDifficulty: number,
  minDifficulty: number,
  moneyAvailable: number,
  moneyMax: number,
  numOpenPortsRequired: number,
  openPortCount: number,
  requiredHackingSkill: number,
  serverGrowth: number
}


type BitBurnerAction = {
  action: string,
  params?: string[]
}

function data(ev: MessageEvent) {
  return JSON.parse(ev.data);
}

class BitBurnerClientSocket extends BitBurnerSocket {

  createSocket(type: string): WebSocket {
    const socket = super.createSocket(type);
    socket.addEventListener('message', ({ data }) => {
      const { uuid, ...detail } = JSON.parse(data);
      if (uuid) socket.dispatchEvent(new CustomEvent(uuid, { detail }))
    });
    return socket;
  }

  connectToServer(path: string[]) {
    this.sendAction({ action: 'connect', params: path });
  }

  async sendAction(action: BitBurnerAction) {
    const uuid = v4();
    return new Promise(async resolve => {
      if (this.socket.readyState == this.socket.OPEN)
        this.send({ uuid, ...action });
      else
        this.once('open', async () => this.send({ uuid, ...action }));

      this.once(uuid as any, (({detail}:CustomEvent) => resolve(detail.data))as EventListener);
    })
  }

  async getNetworkData(): Promise<NetworkData> {
    return await this.sendAction({ action: 'scan-network' }) as NetworkData;
    // return new Promise(resolve => {
    //   this.once('message', (ev) => { resolve(data(ev)) })
    //   this.sendAction({ action: 'scan-network' })
    // })
  }

  async loadTheme() {
    const theme = await this.sendAction({ action: 'ns-function', params: ['ui.getTheme'] }) as { [key: string]: string };
    console.log('LOADING THEME');
    Object.entries(theme).forEach(([key, value]) => {
      document.body.style.setProperty(`--${key}`, value);
    })

    // this.once('message', ev => {
    //   console.log('RECEIVED THEME', ev);

    //   Object.entries<string>(data(ev)).forEach(([key, value]) => {
    //     document.body.style.setProperty(`--${key}`, value);
    //   })
    // });
    // this.sendAction({ action: 'ns-function', params: ['ui.getTheme'] })
  }
}

export const BitBurnerClient = new BitBurnerClientSocket('extension');
