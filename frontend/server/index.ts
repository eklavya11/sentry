import express from 'express';
import { Request, Response } from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(3000, '0.0.0.0', (err: any) => {
      if (err) throw err;
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
