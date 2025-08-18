// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config'; // Import and call config from dotenv

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Pipes de validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(3001, '0.0.0.0');
  
  logger.log(`🚀 Serveur démarré sur http://0.0.0.0:${port}`);
  logger.log(`📧 Email configuré: ${process.env.EMAIL_USER}`);
  logger.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.log(`🗄️ Base de données: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
}

bootstrap().catch((error) => {
  console.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});