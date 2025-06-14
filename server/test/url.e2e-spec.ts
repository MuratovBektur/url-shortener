import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UrlModule } from '../src/url/url.module';
import { getModelToken } from '@nestjs/sequelize';
import { Url } from '../src/url/url.model';
import { UrlClick } from '../src/url/url-click.model';

describe('URL Controller (e2e)', () => {
  let app: INestApplication;

  // Mock модели
  const mockUrlModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockUrlClickModel = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UrlModule],
    })
      .overrideProvider(getModelToken(Url))
      .useValue(mockUrlModel)
      .overrideProvider(getModelToken(UrlClick))
      .useValue(mockUrlClickModel)
      .compile();

    app = moduleFixture.createNestApplication();

    // Добавляем глобальный префикс как в main.ts
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/shorten', () => {
    it('должен создать короткую ссылку с уникальным alias', async () => {
      const uniqueAlias = `test-${Date.now()}`;
      const createUrlDto = {
        originalUrl: 'https://example.com',
        alias: uniqueAlias,
      };

      const mockCreatedUrl = {
        id: 1,
        originalUrl: createUrlDto.originalUrl,
        shortCode: uniqueAlias,
        alias: uniqueAlias,
        expiresAt: null,
        clickCount: 0,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Настраиваем мок для каждого вызова
      mockUrlModel.findOne.mockResolvedValue(null); // alias не существует
      mockUrlModel.create.mockResolvedValue(mockCreatedUrl);

      const response = await request(app.getHttpServer())
        .post('/api/shorten')
        .send(createUrlDto)
        .expect(201);

      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty(
        'originalUrl',
        createUrlDto.originalUrl,
      );
      expect(response.body).toHaveProperty('alias', uniqueAlias);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.shortUrl).toContain(uniqueAlias);
    });

    it('должен создать короткую ссылку без alias', async () => {
      const createUrlDto = {
        originalUrl: 'https://google.com',
      };

      const mockCreatedUrl = {
        id: 2,
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'abc123',
        alias: null,
        expiresAt: null,
        clickCount: 0,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Настраиваем мок
      mockUrlModel.findOne.mockResolvedValue(null); // сгенерированный shortCode не существует
      mockUrlModel.create.mockResolvedValue(mockCreatedUrl);

      const response = await request(app.getHttpServer())
        .post('/api/shorten')
        .send(createUrlDto)
        .expect(201);

      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty(
        'originalUrl',
        createUrlDto.originalUrl,
      );
      expect(response.body).toHaveProperty('alias', null);
      expect(response.body).toHaveProperty('createdAt');
      // Короткий код должен быть сгенерирован автоматически
      expect(response.body.shortUrl).toMatch(/\/[a-zA-Z0-9]{6}$/);
    });

    it('должен вернуть ошибку при дублировании alias', async () => {
      const duplicateAlias = 'short'; // Используем короткий alias
      const createUrlDto = {
        originalUrl: 'https://example.com',
        alias: duplicateAlias,
      };

      const existingUrl = {
        id: 3,
        originalUrl: 'https://other.com',
        shortCode: duplicateAlias,
        alias: duplicateAlias,
        expiresAt: null,
        clickCount: 0,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Настраиваем мок - alias уже существует
      mockUrlModel.findOne.mockResolvedValue(existingUrl);

      const response = await request(app.getHttpServer())
        .post('/api/shorten')
        .send(createUrlDto)
        .expect(409);

      expect(response.body).toHaveProperty('statusCode', 409);
      expect(response.body).toHaveProperty('message', 'Алиас уже используется');
    });

    it('должен валидировать некорректный URL', async () => {
      const createUrlDto = {
        originalUrl: 'invalid-url',
      };

      const response = await request(app.getHttpServer())
        .post('/api/shorten')
        .send(createUrlDto)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /api/:shortCode', () => {
    it('должен вернуть оригинальный URL при переадресации', async () => {
      const shortCode = 'abc123';
      const mockUrlWithUpdate = {
        id: 1,
        originalUrl: 'https://example.com/test-redirect',
        shortCode,
        alias: null,
        expiresAt: null,
        clickCount: 0,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        update: jest.fn().mockResolvedValue(true),
      };

      // Настраиваем мок для поиска URL
      mockUrlModel.findOne.mockResolvedValue(mockUrlWithUpdate);
      mockUrlClickModel.create.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .get(`/api/${shortCode}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'originalUrl',
        'https://example.com/test-redirect',
      );
      expect(mockUrlWithUpdate.update).toHaveBeenCalled();
      expect(mockUrlClickModel.create).toHaveBeenCalled();
    });

    it('должен вернуть 404 для несуществующего shortCode', async () => {
      // Настраиваем мок - ничего не найдено
      mockUrlModel.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty(
        'message',
        'Ссылка не найдена или срок её действия истёк',
      );
    });
  });

  describe('GET /api/info/:shortCode', () => {
    it('должен вернуть информацию о ссылке без увеличения счетчика', async () => {
      const shortCode = 'abc123';
      const mockUrlInfo = {
        id: 1,
        originalUrl: 'https://example.com/info-test',
        shortCode,
        alias: null,
        expiresAt: null,
        clickCount: 5,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Настраиваем мок для поиска URL
      mockUrlModel.findOne.mockResolvedValue(mockUrlInfo);

      const response = await request(app.getHttpServer())
        .get(`/api/info/${shortCode}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'originalUrl',
        'https://example.com/info-test',
      );
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('clickCount', 5);
    });

    it('должен вернуть 404 для несуществующего shortCode', async () => {
      // Настраиваем мок - ничего не найдено
      mockUrlModel.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/api/info/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty(
        'message',
        'Ссылка не найдена или срок её действия истёк',
      );
    });
  });

  describe('GET /api/analytics/:shortCode', () => {
    it('должен вернуть аналитику с правильной структурой', async () => {
      const shortCode = 'abc123';
      const mockAnalyticsUrl = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode,
        alias: null,
        expiresAt: null,
        clickCount: 10,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockClicks = [
        { ipAddress: '192.168.1.1' },
        { ipAddress: '192.168.1.2' },
      ];

      // Настраиваем моки
      mockUrlModel.findOne.mockResolvedValue(mockAnalyticsUrl);
      mockUrlClickModel.findAll.mockResolvedValue(mockClicks);

      const response = await request(app.getHttpServer())
        .get(`/api/analytics/${shortCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalClicks', 10);
      expect(response.body).toHaveProperty('recentIpAddresses');
      expect(Array.isArray(response.body.recentIpAddresses)).toBe(true);
      expect(response.body.recentIpAddresses).toEqual([
        '192.168.1.1',
        '192.168.1.2',
      ]);
    });

    it('должен вернуть 404 для несуществующего shortCode', async () => {
      // Настраиваем мок - ничего не найдено
      mockUrlModel.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/api/analytics/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty(
        'message',
        'Ссылка не найдена или срок её действия истёк',
      );
    });
  });

  describe('DELETE /api/delete/:shortCode', () => {
    it('должен удалить ссылку', async () => {
      const shortCode = 'abc123';
      const mockUrlWithDestroy = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode,
        alias: null,
        expiresAt: null,
        clickCount: 0,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        destroy: jest.fn().mockResolvedValue(true),
      };

      // Настраиваем мок для поиска URL
      mockUrlModel.findOne.mockResolvedValue(mockUrlWithDestroy);

      const response = await request(app.getHttpServer())
        .delete(`/api/delete/${shortCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Ссылка успешно удалена');
      expect(mockUrlWithDestroy.destroy).toHaveBeenCalled();
    });

    it('должен вернуть 404 при попытке удалить несуществующую ссылку', async () => {
      // Настраиваем мок - ничего не найдено
      mockUrlModel.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .delete('/api/delete/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message', 'Ссылка не найдена');
    });
  });
});
