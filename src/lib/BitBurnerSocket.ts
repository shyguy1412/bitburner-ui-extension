const BITBURNER_PORT = 9810

export class BitBurnerSocket {
  socket: WebSocket;
  closed: boolean;

  createSocket(type:string) {
    const socket = new WebSocket('ws://localhost:' + BITBURNER_PORT);

    socket.addEventListener('open', () => {
      socket.send(type);
    })

    socket.addEventListener('error', () => {
      setTimeout(() => {
        this.socket = this.createSocket(type);
      }, 200);
    })
    return socket;
  }

  constructor(type:string) {
    this.closed = false;
    this.socket = this.createSocket(type);
  }

  on<K extends keyof WebSocketEventMap>(event: K, handler: (ev: WebSocketEventMap[K]) => void) {
    this.socket.addEventListener(event, handler as EventListener);
  }

  once<K extends keyof WebSocketEventMap>(event: K, handler: (ev: WebSocketEventMap[K]) => void) {
    const onceHandler = (ev: WebSocketEventMap[K]) => {
      handler(ev);
      this.socket.removeEventListener(event, onceHandler as EventListener);
    }
    this.socket.addEventListener(event, handler as EventListener);
  }

  close(code?: number, reason?: string) {
    this.closed = true;
    this.socket.close(code, reason);
  }

  send(data: any) {
    if (this.socket.readyState == this.socket.OPEN)
      this.socket.send(JSON.stringify(data));
    else
      this.once('open', () => this.socket.send(JSON.stringify(data)))
  }
}
