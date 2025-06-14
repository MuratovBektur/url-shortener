import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Url } from './url.model';

@Table({
  tableName: 'url_clicks',
  timestamps: true,
  updatedAt: false, // нам нужен только createdAt
})
export class UrlClick extends Model<UrlClick> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Url)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  urlId: number;

  @Column({
    type: DataType.STRING(45), // IPv4 или IPv6
    allowNull: false,
  })
  ipAddress: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  userAgent: string;

  @CreatedAt
  clickedAt: Date;

  @BelongsTo(() => Url)
  url: Url;
}
