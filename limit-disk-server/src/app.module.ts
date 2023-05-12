import { Module } from '@nestjs/common';
import { FileSystemModule } from './file-system/file-system.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemEntity } from './file-system/file-system.entity';
import { StaticModule } from './static/static.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'src/database/sqlite/limit-disk.sqlite', // SQLite数据库文件路径
      entities: [FileSystemEntity],
      synchronize: false,
    }),
    FileSystemModule,
    StaticModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
