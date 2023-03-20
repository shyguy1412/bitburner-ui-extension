import { server as WebSocketServer, client as WebSocketClient, connection, Message } from 'websocket';
import { createServer } from 'http';
import { v4 as uuid } from 'uuid';

const BITBURNER_PORT = 9810;

const server = createServer(function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(BITBURNER_PORT, function () {
  console.log((new Date()) + ' Server is listening on port ' + BITBURNER_PORT);
});

export function startWebSocketRelay() {
  const WebSocketRelay = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
  });


  const connectionsMap = new Map<string, connection>();

  WebSocketRelay.on('connect', function (connection) {

    console.log((new Date()) + ' Connection accepted, now open:' + WebSocketRelay.connections.length);

    connection.once('message', (message: Message) => {
      if (message.type != 'utf8') return;
      console.log('Connection from: ', message.utf8Data);

      if (connectionsMap.has(message.utf8Data))
        connectionsMap.get(message.utf8Data)!.close()

      connectionsMap.set(message.utf8Data, connection);

      connection.on('message', (message) => {
        if (message.type != 'utf8') return;

        WebSocketRelay.connections.forEach(relayConnection => {
          if (relayConnection == connection) return;
          relayConnection.sendUTF(message.utf8Data);
        })
      });
    })

    connection.on('close', function (reasonCode, description) {
      console.log((new Date()) + ' Peer disconnected, now open:' + WebSocketRelay.connections.length);
    });
  });

  return WebSocketRelay;
}