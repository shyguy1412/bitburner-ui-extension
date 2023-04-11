import { v4 } from "uuid";

type NetworkData = BitburnerServer[]

export type BitburnerServer = {
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


type BitburnerMessage = { action: string, params?: string[] };

export const BitburnerInstance = {
  async getNetworkData(): Promise<NetworkData> {
    return await this.sendAction({ action: 'scan-network' }) as NetworkData;
  },

  connectToServer(path: string[]) {
    this.sendAction({ action: 'connectToServer', params: path });
  },

  async loadTheme() {
    const theme = await this.sendAction({ action: 'ns-function', params: ['ui.getTheme'] }) as { [key: string]: string };
    console.log('LOADING THEME');
    Object.entries(theme).forEach(([key, value]) => {
      document.body.style.setProperty(`--${key}`, value);
    })
  },

  async sendAction(action: BitburnerMessage) {
    const uuid = v4();
    return new Promise(async resolve => {
      window.dispatchEvent(new CustomEvent('bitburner', { detail: { uuid, ...action } }))
      const responseListener = ({ detail }: CustomEvent) => {
        const { uuid: responseID } = detail;
        if (uuid != responseID) return;
        console.log('RESPONSE', detail);

        resolve(detail.data);
        window.removeEventListener('bitburner-response', responseListener as EventListener);
      }

      window.addEventListener('bitburner-response', responseListener as EventListener);
    })
  }
}