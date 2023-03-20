import { BitBurnerSocket } from "./BitBurnerSocket";

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

class BitBurnerClientSocket extends BitBurnerSocket {
  connectToServer(path: string[]) {
    this.sendAction({ action: 'connect', params: path });
  }

  sendAction(action: BitBurnerAction) {
    if (this.socket.readyState == this.socket.OPEN)
      this.socket.send(JSON.stringify(action));
    else
      this.once('open', () => this.socket.send(JSON.stringify(action)))
  }

  async getNetworkData(): Promise<NetworkData> {
    return new Promise(resolve => {
      this.once('message', (ev) => { resolve(JSON.parse(ev.data)) })
      this.sendAction({ action: 'scan-network' })
    })
  }
}

export const BitBurnerClient = new BitBurnerClientSocket();

// import { EventHandler } from "react";

// const BITBURNER_PORT = 9810


// type BitBurnerClientEvent = 'message' | 'open';


// export const BitBurnerClient = {
//   socket: (() => {
//     const socket = new WebSocket('ws:/localhost:' + BITBURNER_PORT);

//     return socket;
//   })(),
//   // eventTarget: new EventTarget(),

//   once<K extends keyof WebSocketEventMap>(event: K, handler: (ev: CustomEvent) => void) {
//     const listener = ((ev: CustomEvent) => {
//       handler(ev);
//       this.socket.removeEventListener(event, listener);
//     }) as EventListener

//     this.socket.addEventListener(event, listener);
//   },

//   on<K extends keyof WebSocketEventMap>(event: K, handler: (ev: CustomEvent) => void) {
//     this.socket.addEventListener(event, handler as EventListener);
//   },

// connectToServer(path: string[]) {
//   // console.log(path);
//   this.sendAction({ action: 'connect', params: path });
// },

// sendAction(action: BitBurnerAction) {
//   if (this.socket.readyState == this.socket.OPEN)
//     this.socket.send(JSON.stringify(action));
//   else
//     this.once('open', () => this.socket.send(JSON.stringify(action)))
//   console.log(this.socket.OPEN);

// },

//   async getNetworkData(): Promise < NetworkData > {
//   return new Promise(resolve => {
//     this.once('message', (ev) => { resolve(ev.detail.message) })
//     this.sendAction({ action: 'scan-network' })
//   })
// }
// }

// BitBurnerClient.on('message', (message) => console.log('WS Received: ', message))