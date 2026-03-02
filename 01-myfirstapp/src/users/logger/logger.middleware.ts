
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    
    //originalUrl son todas las urls que esten en el controller donde esta el middleware
    console.log('middleware',req.originalUrl);
    
    next();
  }
}
