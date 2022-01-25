import { Server } from 'socket.io';
import { OrderBookManager, PriceManager } from '../managers';
import listenTokens from './routes/tokens';
import listenUser from './routes/user';
import listenQuotes from './routes/quotes';

export async function connect(io: Server) {
  console.log('Listening for Socket.io connections');
  io.on('connection', (socket) => {
    console.log('got a connection', socket.id);

    socket.on('disconnect', () => {
      console.log('disconnected', socket.id);
    });

    listenTokens(socket);
    listenUser(socket);
    listenQuotes(socket);
    socket.emit('success');
  });

  OrderBookManager.setIo(io);
  PriceManager.setIo(io);
}
