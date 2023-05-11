import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FileSystemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  name: string;

  @Column()
  time: number;

  @Column()
  parentPath: string;
}
