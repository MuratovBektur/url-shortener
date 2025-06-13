import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  Req,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenResponseDto } from './dto/url-response.dto';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async shortenUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Req() req: Request,
  ): Promise<ShortenResponseDto> {
    try {
      return await this.urlService.shortenUrl(createUrlDto, req);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Произошла ошибка при создании сокращенной ссылки',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    // Базовая валидация shortCode
    if (!shortCode || shortCode.length < 3 || shortCode.length > 20) {
      res.status(404).send('Ссылка не найдена');
      return;
    }

    try {
      const url = await this.urlService.findByShortCode(shortCode);

      if (!url) {
        res.status(404).send('Ссылка не найдена или срок её действия истёк');
        return;
      }

      res.redirect(301, url.originalUrl);
    } catch (error) {
      console.error('Ошибка при редиректе:', error);
      res.status(500).send('Произошла ошибка сервера');
    }
  }
}
