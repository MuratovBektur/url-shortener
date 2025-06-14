export class UrlResponseDto {
  id: number;
  originalUrl: string;
  shortCode: string;
  alias?: string;
  shortUrl: string;
  expiresAt?: Date;
  clickCount: number;
  createdAt: Date;
}

export class ShortenResponseDto {
  shortUrl: string;
  originalUrl: string;
  expiresAt?: Date;
  alias?: string;
  createdAt: Date;
}

export class UrlInfoResponseDto {
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
}
