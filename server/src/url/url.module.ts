import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { UrlClick } from './url-click.model';

@Module({
  imports: [SequelizeModule.forFeature([Url, UrlClick])],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
