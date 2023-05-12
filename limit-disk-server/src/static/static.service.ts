import { Injectable } from '@nestjs/common';
import { stat } from 'node:fs';
import { join, normalize } from 'node:path';

@Injectable()
export class StaticService {
  isStaticFileAccess(
    path: string,
    absolute = false,
  ): Promise<{ result: boolean; path: string }> {
    path = absolute ? normalize(path) : join(__dirname, '../../static', path);
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
