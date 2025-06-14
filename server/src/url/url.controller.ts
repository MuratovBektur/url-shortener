import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenResponseDto, UrlInfoResponseDto } from './dto/url-response.dto';

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
  async getUrlData(
    @Param('shortCode') shortCode: string,
  ): Promise<{ originalUrl: string }> {
    try {
      const url = await this.urlService.findByShortCode(shortCode);

      if (!url) {
        throw new HttpException(
          'Ссылка не найдена или срок её действия истёк',
          HttpStatus.NOT_FOUND,
        );
      }

      return { originalUrl: url.originalUrl };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при получении URL:', error);
      throw new HttpException(
        'Произошла ошибка сервера',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('info/:shortCode')
  async getUrlInfo(
    @Param('shortCode') shortCode: string,
  ): Promise<UrlInfoResponseDto> {
    try {
      const url = await this.urlService.getUrlInfo(shortCode);

      if (!url) {
        throw new HttpException(
          'Ссылка не найдена или срок её действия истёк',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
        clickCount: url.clickCount,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при получении информации о URL:', error);
      throw new HttpException(
        'Произошла ошибка сервера',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
