"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let EmailVerificationService = EmailVerificationService_1 = class EmailVerificationService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(EmailVerificationService_1.name);
        this.isConfigured = false;
    }
    async onModuleInit() {
        await this.initializeTransporter();
    }
    async initializeTransporter() {
        try {
            this.logger.log('Initialisation du service email...');
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                throw new Error('Variables EMAIL_USER et EMAIL_PASSWORD requises');
            }
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
                pool: true,
                maxConnections: 5,
                maxMessages: 10,
                debug: process.env.NODE_ENV === 'development',
            });
            await this.transporter.verify();
            this.isConfigured = true;
            this.logger.log(`✅ Configuration email vérifiée: ${process.env.EMAIL_USER}`);
        }
        catch (error) {
            this.logger.error('❌ Erreur de configuration email:', error.message);
            this.isConfigured = false;
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn('⚠️ Mode développement: service email désactivé');
            }
            else {
                throw new common_1.HttpException('Configuration email incorrecte', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    checkEmailConfiguration() {
        if (!this.isConfigured) {
            throw new common_1.HttpException('Service email non configuré', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async sendVerificationCode(email) {
        this.logger.log(`📧 Demande de code de vérification pour: ${email}`);
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                this.logger.warn(`❌ Utilisateur non trouvé: ${email}`);
                throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
            }
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const codeExpiry = new Date(Date.now() + 15 * 60 * 1000);
            user.verification_code = verificationCode;
            user.verification_code_expiry = codeExpiry;
            await this.userRepository.save(user);
            this.logger.log(`💾 Code sauvegardé en base pour ${email}: ${verificationCode}`);
            if (this.isConfigured) {
                await this.sendEmail({
                    to: email,
                    subject: 'Code de vérification - Chrono Carto',
                    html: this.getVerificationCodeEmailTemplate(user.first_name, verificationCode),
                });
                this.logger.log(`✅ Code de vérification envoyé à ${email}`);
            }
            else {
                this.logger.warn(`⚠️ Email non envoyé (service désactivé). Code: ${verificationCode}`);
            }
            return { message: 'Code de vérification envoyé par email' };
        }
        catch (error) {
            this.logger.error(`❌ Erreur lors de l'envoi du code pour ${email}:`, error.message);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Erreur lors de l\'envoi de l\'email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyCode(email, code) {
        this.logger.log(`🔍 Vérification de code pour: ${email}, code: ${code}`);
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.warn(`❌ Utilisateur non trouvé: ${email}`);
            throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
        }
        this.logger.log(`📋 Code en base: ${user.verification_code}, expire: ${user.verification_code_expiry}`);
        if (!user.verification_code || !user.verification_code_expiry) {
            this.logger.warn(`❌ Aucun code de vérification trouvé pour: ${email}`);
            throw new common_1.HttpException('Aucun code de vérification trouvé', common_1.HttpStatus.BAD_REQUEST);
        }
        if (new Date() > user.verification_code_expiry) {
            this.logger.warn(`❌ Code expiré pour: ${email}`);
            throw new common_1.HttpException('Code de vérification expiré', common_1.HttpStatus.BAD_REQUEST);
        }
        if (user.verification_code !== code) {
            this.logger.warn(`❌ Code invalide pour: ${email}`);
            throw new common_1.HttpException('Code de vérification invalide', common_1.HttpStatus.BAD_REQUEST);
        }
        user.email_verified = true;
        user.verification_code = null;
        user.verification_code_expiry = null;
        await this.userRepository.save(user);
        this.logger.log(`✅ Email vérifié avec succès pour: ${email}`);
        return { message: 'Email vérifié avec succès' };
    }
    async sendVerificationLink(email) {
        this.logger.log(`📧 Demande de lien de vérification pour: ${email}`);
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                this.logger.warn(`❌ Utilisateur non trouvé: ${email}`);
                throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
            }
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
            user.verification_token = verificationToken;
            user.verification_token_expiry = tokenExpiry;
            await this.userRepository.save(user);
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            if (this.isConfigured) {
                await this.sendEmail({
                    to: email,
                    subject: 'Vérification de votre email - Chrono Carto',
                    html: this.getVerificationLinkEmailTemplate(user.first_name, verificationUrl),
                });
                this.logger.log(`✅ Lien de vérification envoyé à ${email}`);
            }
            else {
                this.logger.warn(`⚠️ Lien non envoyé (service désactivé). URL: ${verificationUrl}`);
            }
            return { message: 'Lien de vérification envoyé par email' };
        }
        catch (error) {
            this.logger.error(`❌ Erreur lors de l'envoi du lien pour ${email}:`, error.message);
            throw new common_1.HttpException('Erreur lors de l\'envoi de l\'email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyToken(token) {
        console.log(`Vérification du token: ${token.substring(0, 8)}...`);
        try {
            const payload = this.jwtService.verify(token);
            console.log(`Payload du token:`, payload);
            const user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                console.error(`Utilisateur non trouvé pour l'email: ${payload.email}`);
                throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
            }
            console.log(`Mise à jour email_verified pour l'utilisateur: ${user.id}`);
            user.email_verified = true;
            await this.usersService.update(user.id, { email_verified: true });
            console.log(`email_verified mis à jour à true pour ${payload.email}`);
            return { email: payload.email };
        }
        catch (error) {
            console.error('Erreur vérification token:', error.message);
            throw new common_1.HttpException('Token invalide ou expiré', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendPasswordResetCode(email) {
        this.logger.log(`📧 Demande de code reset pour: ${email}`);
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.warn(`❌ Utilisateur non trouvé pour reset code: ${email} - Envoi simulé`);
            return { message: 'Si cet email existe, un code de réinitialisation a été envoyé.' };
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiry = new Date(Date.now() + 15 * 60 * 1000);
        user.password_reset_code = resetCode;
        user.password_reset_code_expiry = codeExpiry;
        await this.userRepository.save(user);
        if (this.isConfigured) {
            await this.sendEmail({
                to: email,
                subject: 'Code de réinitialisation de mot de passe - Chrono Carto',
                html: this.getPasswordResetCodeEmailTemplate(user.first_name, resetCode),
            });
        }
        else {
            this.logger.warn(`⚠️ Code reset non envoyé. Code: ${resetCode}`);
        }
        this.logger.log(`✅ Code reset envoyé à ${email}`);
        return { message: 'Code de réinitialisation envoyé par email' };
    }
    async verifyPasswordResetCode(email, code) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
        }
        if (!user.password_reset_code || !user.password_reset_code_expiry) {
            throw new common_1.HttpException('Aucun code de réinitialisation trouvé', common_1.HttpStatus.BAD_REQUEST);
        }
        if (new Date() > user.password_reset_code_expiry) {
            throw new common_1.HttpException('Code de réinitialisation expiré', common_1.HttpStatus.BAD_REQUEST);
        }
        if (user.password_reset_code !== code) {
            throw new common_1.HttpException('Code de réinitialisation invalide', common_1.HttpStatus.BAD_REQUEST);
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        user.password_reset_token = resetToken;
        user.password_reset_token_expiry = tokenExpiry;
        user.password_reset_code = null;
        user.password_reset_code_expiry = null;
        await this.userRepository.save(user);
        return { message: 'Code vérifié avec succès', token: resetToken };
    }
    async sendPasswordResetLink(email) {
        this.logger.log(`📧 Demande de lien reset pour: ${email}`);
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.warn(`❌ Utilisateur non trouvé pour reset: ${email} - Envoi simulé pour sécurité`);
            return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        user.password_reset_token = resetToken;
        user.password_reset_token_expiry = tokenExpiry;
        await this.userRepository.save(user);
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        if (this.isConfigured) {
            await this.sendEmail({
                to: email,
                subject: 'Réinitialisation de mot de passe - Chrono Carto',
                html: this.getPasswordResetLinkEmailTemplate(user.first_name, resetUrl),
            });
        }
        else {
            this.logger.warn(`⚠️ Lien reset non envoyé. URL: ${resetUrl}`);
        }
        this.logger.log(`✅ Lien reset envoyé à ${email}`);
        return { message: 'Lien de réinitialisation envoyé par email' };
    }
    async sendEmail(options) {
        this.checkEmailConfiguration();
        const mailOptions = {
            from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };
        await this.transporter.sendMail(mailOptions);
    }
    getVerificationCodeEmailTemplate(firstName, code) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 2rem; margin: 0;">Chrono Carto</h1>
        </div>
        
        <h2 style="color: #333; text-align: center;">Vérification de votre compte</h2>
        <p>Bonjour ${firstName || 'Utilisateur'},</p>
        <p>Merci de vous être inscrit sur Chrono Carto. Votre code de vérification est :</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 30px 0; border-radius: 8px; border: 2px dashed #667eea;">
          ${code}
        </div>
        
        <p style="color: #666;">Ce code expire dans <strong>15 minutes</strong>.</p>
        <p style="color: #666;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Chrono Carto - Plateforme éducative<br>
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;
    }
    getVerificationLinkEmailTemplate(firstName, verificationUrl) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 2rem; margin: 0;">Chrono Carto</h1>
        </div>
        
        <h2 style="color: #333; text-align: center;">Vérification de votre compte</h2>
        <p>Bonjour ${firstName || 'Utilisateur'},</p>
        <p>Merci de vous être inscrit sur Chrono Carto. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            Vérifier mon email
          </a>
        </div>
        
        <p style="color: #666;">Ou copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #667eea; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationUrl}</p>
        
        <p style="color: #666;">Ce lien expire dans <strong>24 heures</strong>.</p>
        <p style="color: #666;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Chrono Carto - Plateforme éducative<br>
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;
    }
    getPasswordResetCodeEmailTemplate(firstName, code) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 2rem; margin: 0;">Chrono Carto</h1>
        </div>
        
        <h2 style="color: #333; text-align: center;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${firstName || 'Utilisateur'},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Votre code de vérification est :</p>
        
        <div style="background-color: #fff3cd; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 30px 0; border-radius: 8px; border: 2px dashed #dc3545;">
          ${code}
        </div>
        
        <p style="color: #666;">Ce code expire dans <strong>15 minutes</strong>.</p>
        <p style="color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Chrono Carto - Plateforme éducative<br>
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;
    }
    getPasswordResetLinkEmailTemplate(firstName, resetUrl) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 2rem; margin: 0;">Chrono Carto</h1>
        </div>
        
        <h2 style="color: #333; text-align: center;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${firstName || 'Utilisateur'},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="color: #666;">Ou copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #dc3545; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
        
        <p style="color: #666;">Ce lien expire dans <strong>1 heure</strong>.</p>
        <p style="color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Chrono Carto - Plateforme éducative<br>
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    `;
    }
    async getEmailConfiguration() {
        return {
            isConfigured: this.isConfigured,
            emailUser: process.env.EMAIL_USER,
            frontendUrl: process.env.FRONTEND_URL,
            hasPassword: !!process.env.EMAIL_PASSWORD,
        };
    }
    async testEmailConnection() {
        if (!this.isConfigured) {
            throw new common_1.HttpException('Service email non configuré', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            await this.transporter.verify();
            return { success: true, message: 'Connexion email OK' };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
};
exports.EmailVerificationService = EmailVerificationService;
exports.EmailVerificationService = EmailVerificationService = EmailVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmailVerificationService);
//# sourceMappingURL=email-verification.service.js.map