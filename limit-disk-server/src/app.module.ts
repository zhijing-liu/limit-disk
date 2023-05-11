import { Module } from '@nestjs/common';
import { FileSystemModule } from './file-system/file-system.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemEntity } from './file-system/file-system.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'src/database/sqlite/limit-disk.sqlite', // SQLite数据库文件路径
      entities: [FileSystemEntity],
      synchronize: false,
    }),
    FileSystemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
