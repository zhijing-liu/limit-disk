import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileSystemService } from './file-system.service';
import { response } from '../response';

@Controller('/file-system')
export class FileSystemController {
  constructor(private fileSystemService: FileSystemService) {}
  @Get('/disk-character')
  async getDiskCharacter() {
    const list = await this.fileSystemService.getDiskCharacter();
    return response('file-system', 'disk-character', 's1', list);
  }
  @Post('/get-dir')
  async getDir(@Body() body): Promise<any> {
    return this.fileSystemService
      .getDir({
        path: body.path,
        start: body.start,
        step: body.step,
        deep: body.deep,
        detail: body.detail,
      })
      .then((list) => {
        return response('file-system', 'get-dir', 's1', list);
      });
  }
  @Post('/get-dir-info')
  async getDirInfo(@Body() body): Promise<any> {
    const result = this.fileSystemService.getDirInfo(body.path);
    return response('file-system', 'get-dir-info', 's1', result);
  }
  @Get('/collect-path')
  async getCollectPath() {
    const result = await this.fileSystemService.getCollectPath();
    return response('file-system', 'collect-path', 's1', result);
  }
  @Post('/add-collect-path')
  async addCollectPath(@Body() { path }: { path: string }) {
    const result = await this.fileSystemService.addCollectPath(path);
    return response('file-system', 'add-collect-path', result ? 's1' : 's2');
  }
  @Post('/upload-files')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body,
  ) {
    // console.log(files, body.path);
    await this.fileSystemService.uploadFiles(files, body.path);
    return response('file-system', 'upload-files', 's1');
  }
}
