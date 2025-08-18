"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
require("dotenv/config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
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
//# sourceMappingURL=main.js.map