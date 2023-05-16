import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileSystemEntity } from './file-system.entity';
import { access, readdir, stat, writeFile, rm, rename } from 'node:fs';
import { join, normalize, extname, basename, dirname } from 'node:path';

interface DirItemType {
  path: string;
  isFile: boolean;
  children?: DirItemType[];
}

type ItemListType =
  | {
      path: string;
      isFile: true;
      name: string;
      suffix: string;
      size: number;
      time: number;
      id: number;
    }
  | {
      path: string;
      isFile: false;
      name: string;
      time: number;
      id: number;
    };

@Injectable()
export class FileSystemService {
  constructor(
    @InjectRepository(FileSystemEntity)
    private readonly fileSystemEntityRepository: Repository<FileSystemEntity>,
  ) {}

  // 获取盘符
  async getDiskCharacter() {
    const promiseList = [];
    for (let i = 65; i <= 90; i++) {
      const drive = `${String.fromCharCode(i)}:\\`;
      promiseList.push(
        new Promise((resolve, reject) => {
          access(drive, (err) => {
            err ? reject() : resolve(drive);
          });
        }),
      );
    }
    return (await Promise.allSettled(promiseList))
      .filter(({ status }) => status === 'fulfilled')
      .map((value: PromiseFulfilledResult<string>) => value.value);
  }
  // 获取目录信息
  getDirInfo(path: string) {
    const parentPath = dirname(path);
    return {
      path,
      parentPath: parentPath === path ? undefined : parentPath,
      isFile: false,
      name: basename(path) || path,
    };
  }
  // 获取目录内容
  async getDir({
    path,
    start = 0,
    step,
    deep = false,
    detail = false,
  }: {
    path: string;
    start: number;
    step?: number;
    deep: boolean | number;
    detail: boolean;
  }) {
    const action = detail
      ? (list, dirPath) =>
          Promise.allSettled(
            list.map((dirent) => {
              const path = join(dirPath, dirent.name);
              const isFile = dirent.isFile();
              return new Promise((resolve, reject) => {
                stat(path, (err, stats) => {
                  if (err) {
                    reject();
                  } else {
                    const data = {
                      path,
                      parentPath: dirPath,
                      isFile,
                      name: dirent.name,
                      size: undefined,
                      suffix: undefined,
                      time: stats.birthtimeMs,
                    };
                    if (isFile) {
                      data.size = stats.size;
                      data.suffix = extname(dirent.name);
                    }
                    resolve(data);
                  }
                });
              });
            }),
          ).then((list) =>
            list
              .filter(({ status }) => status === 'fulfilled')
              .map(({ value }: PromiseFulfilledResult<any>) => value),
          )
      : (list, dirPath) =>
          list.map((dirent) => ({
            path: join(dirPath, dirent.name),
            parentPath: dirPath,
            isFile: dirent.isFile(),
            name: dirent.name,
          }));
    const getList = (p, floor): Promise<DirItemType[]> => {
      const dirPath = normalize(p);
      return new Promise((resolve) => {
        readdir(dirPath, { withFileTypes: true }, async (err, files) => {
          if (err) {
            resolve([]);
          } else {
            const list: DirItemType[] = (await action(files, dirPath)).slice(
              start,
              step && start + step,
            );
            // 深度检索
            if (deep && (typeof deep === 'boolean' || deep > floor)) {
              for (const item of list.filter(({ isFile }) => !isFile)) {
                item.children = await getList(item.path, floor + 1);
              }
            }
            resolve(list);
          }
        });
      });
    };
    return getList(path, 0);
  }

  // 获取收藏地址
  async getCollectPath(): Promise<ItemListType[]> {
    const list = await this.fileSystemEntityRepository.find();
    return Promise.allSettled(
      list.map(
        ({ id, path, name, time, parentPath }) =>
          new Promise((resolve, reject) => {
            stat(path, (err, stats) => {
              if (err) {
                reject();
              } else {
                if (stats.isFile()) {
                  resolve({
                    id,
                    path,
                    name,
                    time,
                    isFile: true,
                    suffix: extname(name),
                    size: stats.size,
                    parentPath,
                  });
                } else {
                  resolve({
                    id,
                    path,
                    name,
                    time,
                    isFile: false,
                    parentPath,
                  });
                }
              }
            });
          }),
      ),
    ).then((list) =>
      list
        .filter(({ status }) => status === 'fulfilled')
        .map(({ value }: PromiseFulfilledResult<ItemListType>) => value),
    );
  }

  // 新增收藏地址
  async addCollectPath(path: string) {
    const has = await this.fileSystemEntityRepository.findOneBy({ path });
    if (has === null) {
      const { name, parentPath } = this.getDirInfo(path);
      await this.fileSystemEntityRepository.save({
        path,
        time: new Date().getTime(),
        name,
        parentPath,
      });
      return true;
    } else {
      return false;
    }
  }
  // 取消收藏地址
  async cancelCollectPath(path: string) {
    return this.fileSystemEntityRepository
      .createQueryBuilder()
      .delete()
      .where('path = :path', { path })
      .execute();
  }
  async writeFile(file: Express.Multer.File, path: string) {
    return new Promise((resolve, reject) => {
      writeFile(join(path, file.originalname), file.buffer, (err) => {
        if (err) {
          reject();
        } else {
          resolve(true);
        }
      });
    });
  }
  async uploadFiles(files: Express.Multer.File[], path: string) {
    return Promise.all(files.map((file) => this.writeFile(file, path)));
  }
  async removeItem(path) {
    return new Promise((resolve, reject) => {
      rm(path, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
  async removeItems(pathList: string[]) {
    return Promise.allSettled(pathList.map((path) => this.removeItem(path)));
  }
  async copyTo(path: string, items: ItemListType[]) {
    return Promise.allSettled(
      items.map(
        ({ path: sourcePath }) =>
          new Promise((resolve, reject) => {
            resolve(true);
          }),
      ),
    );
  }
  async moveTo(path: string, items: ItemListType[]) {
    return Promise.allSettled(
      items.map(
        ({ path: sourcePath, name }) =>
          new Promise((resolve, reject) => {
            rename(sourcePath, join(path, name), (err) => {
              if (err) {
                reject();
              } else {
                resolve(true);
              }
            });
          }),
      ),
    );
  }
}
