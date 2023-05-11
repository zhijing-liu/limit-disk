import { Module } from '@nestjs/common';
import { FileSystemController } from './file-system.controller';
import { FileSystemService } from './file-system.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemEntity } from './file-system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileSystemEntity])],
  controllers: [FileSystemController],
  providers: [FileSystemService],
  exports: [FileSystemService],
})
export class FileSystemModule {}
