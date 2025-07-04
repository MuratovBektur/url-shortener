import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  Query,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import {
  ShortenResponseDto,
  UrlInfoResponseDto,
  UrlAnalyticsResponseDto,
  UrlResponseDto,
} from './dto/url-response.dto';

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

  @Get('urls')
  async getAllUrls(
    @Req() req: Request,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<UrlResponseDto[]> {
    try {
      return await this.urlService.getAllUrls(req, sortBy, sortOrder);
    } catch (error) {
      console.error('Ошибка при получении списка URL:', error);
      throw new HttpException(
        'Произошла ошибка сервера',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':shortCode')
  async getUrlData(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
  ): Promise<{ originalUrl: string }> {
    try {
      const url = await this.urlService.findByShortCode(shortCode, req);

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

  @Delete('delete/:shortCode')
  async deleteUrl(
    @Param('shortCode') shortCode: string,
  ): Promise<{ message: string }> {
    try {
      const isDeleted = await this.urlService.deleteUrl(shortCode);

      if (!isDeleted) {
        throw new HttpException('Ссылка не найдена', HttpStatus.NOT_FOUND);
      }

      return { message: 'Ссылка успешно удалена' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при удалении URL:', error);
      throw new HttpException(
        'Произошла ошибка сервера',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/:shortCode')
  async getAnalytics(
    @Param('shortCode') shortCode: string,
  ): Promise<UrlAnalyticsResponseDto> {
    try {
      const analytics = await this.urlService.getAnalytics(shortCode);

      if (!analytics) {
        throw new HttpException(
          'Ссылка не найдена или срок её действия истёк',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        totalClicks: analytics.totalClicks,
        todayClicks: analytics.todayClicks,
        weekClicks: analytics.weekClicks,
        dailyClicks: analytics.dailyClicks,
        recentIpAddresses: analytics.recentIpAddresses,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при получении аналитики URL:', error);
      throw new HttpException(
        'Произошла ошибка сервера',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
