import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { envConfig } from './config/environment.config.js';
import { ResponseHandler } from './utils/response-handler.util.js';
import { HTTP_STATUS } from './shared/constants/app-constants.js';
import { SocketManager } from './core/socket/socket-manager.js';
import { authMiddleware } from './core/middlewares/auth.middleware.js';
import { IAuthenticatedSocket } from './shared/types/socket.types.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error-handler.middleware.js';

// Import routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { userRoutes } from 'modules/user/user.routes.js';
import { chatRoutes } from 'modules/chat/chat.routes.js';

/**
 * Application Class
 * Main application setup and configuration
 */
export class App {
  public app: Application;
  public httpServer: HttpServer;
  public io: SocketIOServer;
  private socketManager: SocketManager;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = this.initializeSocketIO();
    this.socketManager = new SocketManager(this.io);

    this.configureMiddlewares();
    this.configureRoutes();
    this.configureSocketIO();
    this.configureErrorHandling();
  }

  /**
   * Initialize Socket.IO
   */
  private initializeSocketIO(): SocketIOServer {
    const frontendUrls = envConfig.getFrontendUrls();

    return new SocketIOServer(this.httpServer, {
      cors: {
        origin: frontendUrls,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
      },
    });
  }

  /**
   * Configure Express middlewares
   */
  private configureMiddlewares(): void {
    const frontendUrls = envConfig.getFrontendUrls();

    // CORS Configuration
    this.app.use(
      cors({
        origin: frontendUrls,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      })
    );

    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Cookie parser
    this.app.use(cookieParser());

    // Make io available in req
    this.app.set('io', this.io);
  }

  /**
   * Configure application routes
   */
  private configureRoutes(): void {
    // Health check route
    this.app.get('/api/v1/health', (_req: Request, res: Response) => {
      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Server is running perfectly! 🚀',
        payload: {
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
      });
    });

    // API Routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/admin', adminRoutes.router);
    this.app.use('/api/v1/user', userRoutes);
    this.app.use('/api/v1/chat', chatRoutes);
    // this.app.use('/api/v1/support', supportRoutes);
    // this.app.use('/api/v1/notification', notificationRoutes);

    // 404 Not Found Handler
    this.app.use(notFoundHandler);
  }

  /**
   * Configure Socket.IO with authentication middleware
   */
  private configureSocketIO(): void {
    // Socket authentication middleware
    this.io.use((socket: IAuthenticatedSocket, next: (err?: Error) => void) => {
      // Parse cookies from socket request
      const req = socket.request;
      const res = {} as any;

      cookieParser()(req, res, (err?: any) => {
        if (err) {
          return next(err);
        }
        authMiddleware.socketAuthenticator(socket, next);
      });
    });

    // Initialize socket event handlers
    this.socketManager.handleSocketEvents();
  }

  /**
   * Configure error handling
   */
  private configureErrorHandling(): void {
    // Global error handler
    this.app.use(globalErrorHandler);
  }

  /**
   * Get Socket Manager instance
   */
  public getSocketManager(): SocketManager {
    return this.socketManager;
  }

  /**
   * Get HTTP Server instance
   */
  public getHttpServer(): HttpServer {
    return this.httpServer;
  }

  /**
   * Get Express App instance
   */
  public getApp(): Application {
    return this.app;
  }
}
