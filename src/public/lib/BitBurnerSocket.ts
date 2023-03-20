const BITBURNER_PORT = 9810

export class BitBurnerSocket {
  socket: WebSocket;
  closed: boolean;

  constructor() {
    console.log('SOCKET CREATED');

    this.socket = new WebSocket('ws://localhost:' + BITBURNER_PORT);
    this.closed = false;

    this.once('open', () => {
      this.send('extension');
    })

    this.on('close', () => {
      if (this.closed) console.log('SOCKET CLOSED');

      if (this.closed) return;
      setTimeout(() => {
        this.socket = new WebSocket('ws://localhost:' + BITBURNER_PORT);
      }, 200);
    })
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
    // else
      // this.once('open', () => this.socket.send(JSON.stringify(data)))
  }
}
