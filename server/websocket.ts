import { WebSocketServer, WebSocket } from 'ws';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  retrospectiveId?: string;
}

export const setupWebSocket = (wss: WebSocketServer) => {
  const clients = new Map<WebSocket, ClientConnection>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    const client: ClientConnection = { ws };
    clients.set(ws, client);

    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'join-room':
            client.retrospectiveId = data.retrospectiveId;
            client.userId = data.userId;
            console.log(`User ${data.userId} joined retrospective ${data.retrospectiveId}`);

            // Broadcast user joined event to other clients in the same room
            broadcastToRoom(data.retrospectiveId, {
              type: 'user-joined',
              data: {
                retrospectiveId: data.retrospectiveId,
                user: { id: data.userId, name: data.userName, color: data.userColor },
              },
            }, ws);
            break;

          case 'leave-room':
            if (client.retrospectiveId === data.retrospectiveId) {
              client.retrospectiveId = undefined;
              console.log(`User ${client.userId} left retrospective ${data.retrospectiveId}`);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  const broadcastToRoom = (retrospectiveId: string, message: any, sender?: WebSocket) => {
    clients.forEach((client, clientWs) => {
      if (client.retrospectiveId === retrospectiveId && clientWs !== sender && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(message));
      }
    });
  };

  const broadcastToAll = (message: any) => {
    clients.forEach((_, clientWs) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(message));
      }
    });
  };

  return {
    broadcastToRoom,
    broadcastToAll,
  };
};
