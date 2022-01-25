import { Socket } from 'socket.io';
import { Token } from '../../database';

export default function listen(socket: Socket) {
  socket.on('LOAD_QUOTE_TOKENS', async (networkId, callback) => {
    const quoteTokens = await Token.loadQuoteTokensByNetwork(networkId);

    callback(quoteTokens.map((t) => t.toObject()));
  });
}
