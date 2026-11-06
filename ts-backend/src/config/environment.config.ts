import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment Configuration Module
 * Centralizes all environment variables with type safety
 */
export class EnvironmentConfig {
  // Server Configuration
  public readonly PORT: number;
  public readonly NODE_ENV: string;

  // Frontend URLs
  public readonly FRONTEND_URL1: string;
  public readonly FRONTEND_URL2: string;
  public readonly FRONTEND_URL3: string;

  // Database
  public readonly MONGODB_URL: string;

  // JWT Secret Keys
  public readonly JSON_WEB_TOKEN_KEY: string;
  public readonly ACCESS_TOKEN_KEY: string;
  public readonly REFRESH_TOKEN_KEY: string;
  public readonly RESET_PASSWORD_KEY: string;

  // Email Configuration
  public readonly SMTP_USERNAME: string;
  public readonly SMTP_PASSWORD: string;

  // Push Notifications
  public readonly PUBLIC_VAPID_KEY: string;
  public readonly PRIVATE_VAPID_KEY: string;

  // Admin Credentials
  public readonly adminLoginPath: string;
  public readonly adminEmail: string;
  public readonly adminPassword: string;

  // Cloudinary (optional)
  public readonly CLOUDINARY_CLOUDE_NAME?: string;
  public readonly CLOUDINARY_API_KEY?: string;
  public readonly CLOUDINARY_SECRET_KEY?: string;

  constructor() {
    this.PORT = parseInt(process.env.PORT || '8000', 10);
    this.NODE_ENV = process.env.NODE_ENV || 'development';

    this.FRONTEND_URL1 = this.getEnvVariable('FRONTEND_URL1');
    this.FRONTEND_URL2 = this.getEnvVariable('FRONTEND_URL2');
    this.FRONTEND_URL3 = this.getEnvVariable('FRONTEND_URL3');

    this.MONGODB_URL = this.getEnvVariable('MONGODB_URL');

    this.JSON_WEB_TOKEN_KEY = this.getEnvVariable('JSON_WEB_TOKEN_KEY');
    this.ACCESS_TOKEN_KEY = this.getEnvVariable('ACCESS_TOKEN_KEY');
    this.REFRESH_TOKEN_KEY = this.getEnvVariable('REFRESH_TOKEN_KEY');
    this.RESET_PASSWORD_KEY = this.getEnvVariable('RESET_PASSWORD_KEY');

    this.SMTP_USERNAME = this.getEnvVariable('SMTP_USERNAME');
    this.SMTP_PASSWORD = this.getEnvVariable('SMTP_PASSWORD');

    this.PUBLIC_VAPID_KEY = this.getEnvVariable('PUBLIC_VAPID_KEY');
    this.PRIVATE_VAPID_KEY = this.getEnvVariable('PRIVATE_VAPID_KEY');

    this.adminLoginPath = this.getEnvVariable('ADMIN_LOGIN_PATH');
    this.adminEmail = this.getEnvVariable('ADMIN_LOGIN_EMAIL');
    this.adminPassword = this.getEnvVariable('ADMIN_LOGIN_PASSWORD');

    // Optional Cloudinary config
    this.CLOUDINARY_CLOUDE_NAME = process.env.CLOUDINARY_CLOUDE_NAME;
    this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    this.CLOUDINARY_SECRET_KEY = process.env.CLOUDINARY_SECRET_KEY;
  }

  private getEnvVariable(key: string): string {
    const value = process.env[key];
    if (!value) {
      console.error(`❌ Missing required environment variable: ${key}`);
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
  }

  public getFrontendUrls(): string[] {
    return [this.FRONTEND_URL1, this.FRONTEND_URL2, this.FRONTEND_URL3];
  }

  public isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}

export const envConfig = new EnvironmentConfig();
