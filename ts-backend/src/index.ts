import { App } from './app.js';
import { envConfig } from './config/environment.config.js';
import { databaseConnection } from './config/database.config.js';

/**
 * Server Bootstrap
 * Entry point for the application
 */
class Server {
  private app: App;

  constructor() {
    this.app = new App();
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Connect to database
      await databaseConnection.connect();

      // Start HTTP server
      const httpServer = this.app.getHttpServer();
      httpServer.listen(envConfig.PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 TypeScript Chat Server Started Successfully!           ║
║                                                              ║
║   📍 Server URL: http://localhost:${envConfig.PORT.toString().padEnd(34, ' ')}║
║   🌍 Environment: ${envConfig.NODE_ENV.padEnd(43, ' ')}║
║   📊 Database: Connected                                     ║
║   🔌 Socket.IO: Active                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        `);
      });

      // Handle graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      try {
        // Close HTTP server
        const httpServer = this.app.getHttpServer();
        httpServer.close(() => {
          console.log('✅ HTTP server closed');
        });

        // Disconnect from database
        await databaseConnection.disconnect();
        console.log('✅ Database connection closed');

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

// Bootstrap the server
const server = new Server();
server.start().catch((error) => {
  console.error('❌ Failed to bootstrap server:', error);
  process.exit(1);
});
