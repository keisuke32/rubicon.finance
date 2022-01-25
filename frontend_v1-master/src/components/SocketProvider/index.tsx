import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { websocket } from '../../config';

interface WebSocketContextT {
  socket?: SocketIOClient.Socket;
  loading: boolean;
}

const WebSocketContext = createContext<WebSocketContextT>({
  loading: true,
});

export default ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<SocketIOClient.Socket | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const _socket = io.connect(websocket.url, {
      forceNew: true,
    });

    _socket.on('success', () => {
      setSocket(_socket);
      setLoading(false);
    });

    return () => {
      if (_socket.connected) {
        _socket.disconnect();
      }
    };
  }, []);

  // const sendMessage = (roomId, message) => {
  //     const payload = {
  //         roomId: roomId,
  //         data: message
  //     }
  //     socket.emit("event://send-message", JSON.stringify(payload));
  //     dispatch(updateChatLog(payload));
  // }

  return (
    <WebSocketContext.Provider value={{ socket, loading }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
