import express from 'express';
import { Server } from 'http';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import socketIo from 'socket.io';

import { indexRouter, quotesRouter, tokensRouter } from './routes';
import { connect as connectMongo } from './database';
import { connect as connectSocket } from './sockets';
import { OrderBookManager, PriceManager } from './managers';
// import { discordManager, pollerManager, settingsManager } from './managers';

const app = express();
const server = new Server(app);

let corsOrigin = 'https://app.rubicon.finance';
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'development';
  // console.log('NODE_ENV set to ', process.env.NODE_ENV);
  corsOrigin = 'http://localhost:3001';
  console.log('corsOrigin set to ', corsOrigin);
}

const io = require('socket.io')(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'development';
  console.log('NODE_ENV set to ', process.env.NODE_ENV);
}

app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1', indexRouter);
app.use('/api/v1/tokens', tokensRouter);
app.use('/api/v1/quotes', quotesRouter);
// app.use('/api/v1/monitors', monitorsRouter);

server.listen(app.get('port'), async () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console

  // Socket.io
  await connectSocket(io);

  // MongoDB
  await connectMongo(mongoose);

  PriceManager.init();

  OrderBookManager.init();
});
