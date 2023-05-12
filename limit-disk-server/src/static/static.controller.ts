import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { join } from 'node:path';
import { StaticService } from './static.service';
import { Response } from 'express';

@Controller('static')
export class StaticController {
  constructor(private staticService: StaticService) {}
  defaultStaticPath = join(__dirname, '../../static/web/index.html');
  @Get('/web/?:path(*)')
  async getWeb(@Param() params, @Res() res) {
    const { result, path } = await this.staticService.isStaticFileAccess(
      join('web', params.path),
    );
    if (result) {
      res.sendFile(path);
    } else {
      res.sendFile(this.defaultStaticPath);
    }
  }
  @Get('/file/:fileName')
  async get(@Query() query, @Res() res: Response) {
    const { result, path } = await this.staticService.isStaticFileAccess(
      query.path,
      true,
    );
    if (result) {
      res[query.download ? 'download' : 'sendFile'](path);
    } else {
      res.status(404).send('file not found');
    }
  }
}
