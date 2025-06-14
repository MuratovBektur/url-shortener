import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { Url } from './url.model';
import { UrlClick } from './url-click.model';
import { CreateUrlDto } from './dto/create-url.dto';
import { ShortenResponseDto, UrlResponseDto } from './dto/url-response.dto';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url)
    private urlModel: typeof Url,
    @InjectModel(UrlClick)
    private urlClickModel: typeof UrlClick,
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

  async findByShortCode(shortCode: string, req?: Request): Promise<Url | null> {
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

    // Сохранение клика для аналитики (если передан req)
    if (req) {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.get('User-Agent') || '';

      await this.urlClickModel.create({
        urlId: url.id,
        ipAddress,
        userAgent,
      });
    }

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

  async deleteUrl(shortCode: string): Promise<boolean> {
    const url = await this.urlModel.findOne({
      where: { shortCode },
    });

    if (!url) return false;

    // Удаляем связанные клики
    await this.urlClickModel.destroy({
      where: { urlId: url.id },
    });

    await url.destroy();
    return true;
  }

  async getAllUrls(
    req?: Request,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<UrlResponseDto[]> {
    const orderField = sortBy || 'createdAt';
    const orderDirection = sortOrder || 'desc';

    // Определяем правильное поле для сортировки
    let orderColumn: string;
    switch (orderField) {
      case 'clicks':
        orderColumn = 'clickCount';
        break;
      case 'alias':
        orderColumn = 'alias';
        break;
      default:
        orderColumn = 'createdAt';
    }

    const urls = await this.urlModel.findAll({
      order: [[orderColumn, orderDirection.toUpperCase()]],
      attributes: [
        'id',
        'originalUrl',
        'shortCode',
        'alias',
        'expiresAt',
        'clickCount',
        'createdAt',
      ],
    });

    // Динамическое формирование базового URL из запроса
    let baseUrl = 'http://localhost:3000';
    if (req) {
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
      const host = req.get('x-forwarded-host') || req.get('host');
      baseUrl = `${protocol}://${host}`;
    }

    return urls.map((url) => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      alias: url.alias,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      expiresAt: url.expiresAt,
      clickCount: url.clickCount,
      clicks: url.clickCount, // Добавляем поле clicks для совместимости с фронтендом
      createdAt: url.createdAt,
    }));
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

  async getAnalytics(shortCode: string): Promise<{
    totalClicks: number;
    todayClicks: number;
    weekClicks: number;
    dailyClicks: Array<{ date: string; clicks: number }>;
    recentIpAddresses: string[];
  } | null> {
    const url = await this.urlModel.findOne({
      where: { shortCode },
    });

    if (!url) return null;

    // Проверка срока действия
    if (url.expiresAt && url.expiresAt < new Date()) {
      return null;
    }

    // Получение общего количества кликов
    const totalClicks = url.clickCount;

    // Получение всех кликов для обработки
    const allClicks = await this.urlClickModel.findAll({
      where: { urlId: url.id },
      order: [['clickedAt', 'DESC']],
      attributes: ['ipAddress', 'clickedAt'],
    });

    // Текущая дата и времена для фильтрации
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    // Начало недели: 6 дней назад (включая сегодня = 7 дней)
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6,
    );

    // Подсчет кликов за сегодня (календарный день: с 00:00:00 до 23:59:59)
    const todayClicks = allClicks.filter(
      (click) =>
        click.clickedAt >= startOfToday && click.clickedAt < endOfToday,
    ).length;

    // Подсчет кликов за неделю (последние 7 календарных дней включая сегодня)
    const weekClicks = allClicks.filter(
      (click) => click.clickedAt >= startOfWeek,
    ).length;

    // Формирование статистики по дням за последние 30 дней
    const dailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dayClicks = allClicks.filter(
        (click) => click.clickedAt >= startOfDay && click.clickedAt < endOfDay,
      ).length;

      dailyClicks.push({
        date: startOfDay.toISOString().split('T')[0],
        clicks: dayClicks,
      });
    }

    // Последние IP адреса (первые 5)
    const recentIpAddresses = allClicks
      .slice(0, 5)
      .map((click) => click.ipAddress);

    return {
      totalClicks,
      todayClicks,
      weekClicks,
      dailyClicks,
      recentIpAddresses,
    };
  }

  private getClientIp(req: Request): string {
    const xForwardedFor = req.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }

    const xRealIp = req.get('x-real-ip');
    if (xRealIp) {
      return xRealIp;
    }

    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
