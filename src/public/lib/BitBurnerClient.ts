const BITBURNER_PORT = 9810

type BitBurnerAction = {
  action: string,
  params: string[]
}

export class BitBurnerClient {

  private socket:WebSocket;

  constructor(){
    this.socket = new WebSocket('ws:/localhost:' + BITBURNER_PORT);
  }

  connectToServer(path:string[]){
    // console.log(path);
    this.sendAction({action: 'connect', params: path});
  }

  sendAction(action: BitBurnerAction){
    console.log('SEND ACTION');
    
    this.socket.send(JSON.stringify(action));
  }
}