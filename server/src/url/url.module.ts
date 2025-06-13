import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url } from './url.model';

@Module({
  imports: [SequelizeModule.forFeature([Url])],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
