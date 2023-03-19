import { server as WebSocketServer, client as WebSocketClient } from 'websocket';
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

  WebSocketRelay.on('connect', function (connection) {

    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function (message) {
      if(message.type != 'utf8')return;

      WebSocketRelay.connections.forEach(relayConnection => {
        if (relayConnection == connection) return;
        relayConnection.sendUTF(message.utf8Data);
      })
    });

    connection.on('close', function (reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });

  return WebSocketRelay;
}