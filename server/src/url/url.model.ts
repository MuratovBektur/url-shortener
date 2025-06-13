import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'urls',
  timestamps: true,
})
export class Url extends Model<Url> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      len: [4, 2048],
    },
  })
  originalUrl: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    unique: true,
  })
  shortCode: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    unique: true,
  })
  alias: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  clickCount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastClickedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
