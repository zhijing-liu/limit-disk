import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'node:path';
import { StaticService } from './static.service';

@Controller('static')
export class StaticController {
  constructor(private staticService: StaticService) {}
  defaultStaticPath = join(__dirname, '../../static/web/index.html');
  @Get('/?:path(*)')
  async get(@Param() params, @Res() res) {
    const { result, path } = await this.staticService.isStaticFileAccess(
      join('web', params.path),
    );
    if (result) {
      res.sendFile(path);
    } else {
      res.sendFile(this.defaultStaticPath);
    }
  }
}
