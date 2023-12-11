import { NextApiResponseServerIo } from '@/lib/types';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';
import cors from 'cors';

cors()

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = '/socket.io';
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
      transports: ['websocket'],
      // secure: true,
      cors: {
        origin: 'https://notion-ndkhuong.vercel.app',
        methods: ['GET', 'POST'],
      },
    });
    io.on('connection', (s) => {
      s.on('create-room', (fileId) => {
        s.join(fileId);
      });
      s.on('send-changes', (deltas, fileId) => {
        s.to(fileId).emit('receive-changes', deltas, fileId);
      });
      s.on('send-cursor-move', (range, fileId, cursorId) => {
        s.to(fileId).emit('receive-cursor-move', range, fileId, cursorId);
      });
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
