import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { Url } from './url.model';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenResponseDto } from './dto/url-response.dto';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url)
    private urlModel: typeof Url,
  ) {}

  async shortenUrl(
    createUrlDto: CreateUrlDto,
    req: Request,
  ): Promise<ShortenResponseDto> {
    const { originalUrl, expiresAt, alias } = createUrlDto;

    // Проверка существования алиаса
    if (alias) {
      const existingAlias = await this.urlModel.findOne({
        where: { alias },
      });
      if (existingAlias) {
        throw new ConflictException('Алиас уже используется');
      }
    }

    // Проверка валидности даты окончания
    let expirationDate: Date | null = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        throw new BadRequestException('Дата окончания должна быть в будущем');
      }
    }

    // Генерация уникального короткого кода
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = alias || this.generateShortCode();
      const existing = await this.urlModel.findOne({
        where: { shortCode },
      });
      if (!existing) break;

      if (alias) {
        throw new ConflictException('Алиас уже используется');
      }

      attempts++;
      if (attempts >= maxAttempts) {
        throw new ConflictException('Не удалось сгенерировать уникальный код');
      }
    } while (attempts < maxAttempts);

    // Создание записи в БД
    const url = await this.urlModel.create({
      originalUrl,
      shortCode,
      alias: alias || null,
      expiresAt: expirationDate,
    });

    // Динамическое формирование базового URL из запроса
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('x-forwarded-host') || req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    return {
      shortUrl,
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt,
      alias: url.alias,
      createdAt: url.createdAt,
    };
  }

  async findByShortCode(shortCode: string): Promise<Url | null> {
    const url = await this.urlModel.findOne({
      where: { shortCode },
    });

    if (!url) return null;

    // Проверка срока действия
    if (url.expiresAt && url.expiresAt < new Date()) {
      return null;
    }

    // Увеличение счетчика переходов
    await url.update({
      clickCount: url.clickCount + 1,
      lastClickedAt: new Date(),
    });

    return url;
  }

  async getUrlInfo(shortCode: string): Promise<Url | null> {
    const url = await this.urlModel.findOne({
      where: { shortCode },
    });

    if (!url) return null;

    // Проверка срока действия
    if (url.expiresAt && url.expiresAt < new Date()) {
      return null;
    }

    return url;
  }

  private generateShortCode(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
