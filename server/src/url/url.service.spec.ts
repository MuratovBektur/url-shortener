import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { UrlClick } from './url-click.model';
import { Request } from 'express';

describe('UrlService', () => {
  let service: UrlService;
  let urlModel: any;
  let urlClickModel: any;

  const mockUrl = {
    id: 1,
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    alias: null,
    expiresAt: null,
    clickCount: 0,
    lastClickedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockUrlModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockUrlClickModel = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getModelToken(Url),
          useValue: mockUrlModel,
        },
        {
          provide: getModelToken(UrlClick),
          useValue: mockUrlClickModel,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlModel = module.get(getModelToken(Url));
    urlClickModel = module.get(getModelToken(UrlClick));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    const mockRequest = {
      get: jest.fn(),
      protocol: 'http',
    } as unknown as Request;

    beforeEach(() => {
      mockRequest.get = jest.fn().mockImplementation((header) => {
        if (header === 'host') return 'localhost:3000';
        return null;
      });
    });

    it('должен создать короткую ссылку с уникальным alias', async () => {
      const createUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'unique-alias',
      };

      urlModel.findOne.mockResolvedValueOnce(null); // alias не существует
      urlModel.findOne.mockResolvedValueOnce(null); // shortCode не существует
      urlModel.create.mockResolvedValueOnce({
        ...mockUrl,
        alias: createUrlDto.alias,
        shortCode: createUrlDto.alias,
      });

      const result = await service.shortenUrl(createUrlDto, mockRequest);

      expect(result).toHaveProperty('shortUrl');
      expect(result).toHaveProperty('originalUrl', createUrlDto.originalUrl);
      expect(result).toHaveProperty('alias', createUrlDto.alias);
      expect(result.shortUrl).toContain(createUrlDto.alias);
      expect(urlModel.findOne).toHaveBeenCalledWith({
        where: { alias: createUrlDto.alias },
      });
    });

    it('должен создать короткую ссылку без alias', async () => {
      const createUrlDto = {
        originalUrl: 'https://example.com',
      };

      urlModel.findOne.mockResolvedValueOnce(null); // сгенерированный shortCode не существует
      urlModel.create.mockResolvedValueOnce({
        ...mockUrl,
        shortCode: 'abc123',
      });

      const result = await service.shortenUrl(createUrlDto, mockRequest);

      expect(result).toHaveProperty('shortUrl');
      expect(result).toHaveProperty('originalUrl', createUrlDto.originalUrl);
      expect(result).toHaveProperty('alias', null);
      expect(urlModel.create).toHaveBeenCalled();
    });

    it('должен выбросить ConflictException при дублировании alias', async () => {
      const createUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'existing-alias',
      };

      urlModel.findOne.mockResolvedValueOnce(mockUrl); // alias уже существует

      await expect(
        service.shortenUrl(createUrlDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(urlModel.findOne).toHaveBeenCalledWith({
        where: { alias: createUrlDto.alias },
      });
    });

    it('должен выбросить BadRequestException для даты в прошлом', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // вчера
      const createUrlDto = {
        originalUrl: 'https://example.com',
        expiresAt: pastDate.toISOString(),
      };

      await expect(
        service.shortenUrl(createUrlDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('должен создать ссылку с правильной датой окончания', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // завтра
      const createUrlDto = {
        originalUrl: 'https://example.com',
        expiresAt: futureDate.toISOString(),
      };

      urlModel.findOne.mockResolvedValueOnce(null);
      urlModel.create.mockResolvedValueOnce({
        ...mockUrl,
        expiresAt: futureDate,
      });

      const result = await service.shortenUrl(createUrlDto, mockRequest);

      expect(result).toHaveProperty('expiresAt', futureDate);
      expect(urlModel.create).toHaveBeenCalledWith({
        originalUrl: createUrlDto.originalUrl,
        shortCode: expect.any(String),
        alias: null,
        expiresAt: futureDate,
      });
    });
  });

  describe('findByShortCode', () => {
    const mockRequest = {
      get: jest.fn(),
      ip: '127.0.0.1',
    } as unknown as Request;

    it('должен найти URL по shortCode и увеличить счетчик', async () => {
      const shortCode = 'abc123';
      const mockUrlWithUpdate = {
        ...mockUrl,
        shortCode,
        update: jest.fn().mockResolvedValue(true),
      };

      urlModel.findOne.mockResolvedValueOnce(mockUrlWithUpdate);
      urlClickModel.create.mockResolvedValueOnce({});

      const result = await service.findByShortCode(shortCode, mockRequest);

      expect(result).toEqual(mockUrlWithUpdate);
      expect(mockUrlWithUpdate.update).toHaveBeenCalledWith({
        clickCount: mockUrl.clickCount + 1,
        lastClickedAt: expect.any(Date),
      });
      expect(urlClickModel.create).toHaveBeenCalledWith({
        urlId: mockUrl.id,
        ipAddress: '127.0.0.1',
        userAgent: '',
      });
    });

    it('должен вернуть null для несуществующего shortCode', async () => {
      urlModel.findOne.mockResolvedValueOnce(null);

      const result = await service.findByShortCode('nonexistent');

      expect(result).toBeNull();
      expect(urlModel.findOne).toHaveBeenCalledWith({
        where: { shortCode: 'nonexistent' },
      });
    });

    it('должен вернуть null для истекшей ссылки', async () => {
      const expiredUrl = {
        ...mockUrl,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // вчера
      };

      urlModel.findOne.mockResolvedValueOnce(expiredUrl);

      const result = await service.findByShortCode('abc123');

      expect(result).toBeNull();
    });

    it('должен работать без Request объекта', async () => {
      const shortCode = 'abc123';
      const mockUrlWithUpdate = {
        ...mockUrl,
        shortCode,
        update: jest.fn().mockResolvedValue(true),
      };

      urlModel.findOne.mockResolvedValueOnce(mockUrlWithUpdate);

      const result = await service.findByShortCode(shortCode);

      expect(result).toEqual(mockUrlWithUpdate);
      expect(mockUrlWithUpdate.update).toHaveBeenCalled();
      expect(urlClickModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getUrlInfo', () => {
    it('должен вернуть информацию о URL без увеличения счетчика', async () => {
      const shortCode = 'abc123';
      urlModel.findOne.mockResolvedValueOnce(mockUrl);

      const result = await service.getUrlInfo(shortCode);

      expect(result).toEqual(mockUrl);
      expect(urlModel.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
    });

    it('должен вернуть null для несуществующего shortCode', async () => {
      urlModel.findOne.mockResolvedValueOnce(null);

      const result = await service.getUrlInfo('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('deleteUrl', () => {
    it('должен удалить существующий URL', async () => {
      const shortCode = 'abc123';
      const mockUrlWithDestroy = {
        ...mockUrl,
        destroy: jest.fn().mockResolvedValue(true),
      };

      urlModel.findOne.mockResolvedValueOnce(mockUrlWithDestroy);

      const result = await service.deleteUrl(shortCode);

      expect(result).toBe(true);
      expect(mockUrlWithDestroy.destroy).toHaveBeenCalled();
    });

    it('должен вернуть false для несуществующего URL', async () => {
      urlModel.findOne.mockResolvedValueOnce(null);

      const result = await service.deleteUrl('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getAnalytics', () => {
    it('должен вернуть аналитику для существующего URL', async () => {
      const shortCode = 'abc123';
      const mockClicks = [
        { ipAddress: '192.168.1.1' },
        { ipAddress: '192.168.1.2' },
      ];

      urlModel.findOne.mockResolvedValueOnce({
        ...mockUrl,
        clickCount: 5,
      });
      urlClickModel.findAll.mockResolvedValueOnce(mockClicks);

      const result = await service.getAnalytics(shortCode);

      expect(result).toEqual({
        totalClicks: 5,
        recentIpAddresses: ['192.168.1.1', '192.168.1.2'],
      });
      expect(urlClickModel.findAll).toHaveBeenCalledWith({
        where: { urlId: mockUrl.id },
        order: [['clickedAt', 'DESC']],
        limit: 5,
        attributes: ['ipAddress'],
      });
    });

    it('должен вернуть null для несуществующего URL', async () => {
      urlModel.findOne.mockResolvedValueOnce(null);

      const result = await service.getAnalytics('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getClientIp', () => {
    it('должен извлечь IP из x-forwarded-for', async () => {
      const mockRequest = {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
          return null;
        }),
      } as unknown as Request;

      // Используем приватный метод через тестирование публичного метода
      urlModel.findOne.mockResolvedValueOnce({
        ...mockUrl,
        update: jest.fn(),
      });
      urlClickModel.create.mockResolvedValueOnce({});

      await service.findByShortCode('test', mockRequest);

      expect(urlClickModel.create).toHaveBeenCalledWith({
        urlId: mockUrl.id,
        ipAddress: '192.168.1.1',
        userAgent: '',
      });
    });

    it('должен использовать x-real-ip как fallback', async () => {
      const mockRequest = {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'x-real-ip') return '192.168.1.100';
          return null;
        }),
      } as unknown as Request;

      urlModel.findOne.mockResolvedValueOnce({
        ...mockUrl,
        update: jest.fn(),
      });
      urlClickModel.create.mockResolvedValueOnce({});

      await service.findByShortCode('test', mockRequest);

      expect(urlClickModel.create).toHaveBeenCalledWith({
        urlId: mockUrl.id,
        ipAddress: '192.168.1.100',
        userAgent: '',
      });
    });
  });
});
