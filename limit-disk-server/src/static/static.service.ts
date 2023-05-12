import { Injectable } from '@nestjs/common';
import { stat } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class StaticService {
  isStaticFileAccess(path: string): Promise<{ result: boolean; path: string }> {
    path = join(__dirname, '../../static', path);
    return new Promise((resolve) => {
      stat(path, (err, stats) => {
        if (err || stats.isDirectory()) {
          resolve({ result: false, path });
        } else {
          resolve({ result: true, path });
        }
      });
    });
  }
}
