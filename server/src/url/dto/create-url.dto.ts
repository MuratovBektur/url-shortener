import {
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'customUrl', async: false })
export class CustomUrlValidator implements ValidatorConstraintInterface {
  validate(url: string) {
    try {
      const urlObj = new URL(url);

      // Проверяем протокол
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Проверяем наличие хоста
      if (!urlObj.hostname) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'URL должен быть корректным и начинаться с http:// или https://';
  }
}

export class CreateUrlDto {
  @Validate(CustomUrlValidator)
  @MinLength(4, { message: 'URL слишком короткий' })
  @MaxLength(2048, { message: 'URL слишком длинный (максимум 2048 символов)' })
  originalUrl: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Дата окончания должна быть в корректном формате ISO' },
  )
  expiresAt?: string;

  @IsOptional()
  @IsString({ message: 'Алиас должен быть строкой' })
  @MinLength(3, { message: 'Алиас слишком короткий (минимум 3 символа)' })
  @MaxLength(20, { message: 'Алиас слишком длинный (максимум 20 символов)' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Алиас может содержать только буквы, цифры, дефис и подчеркивание',
  })
  alias?: string;
}
