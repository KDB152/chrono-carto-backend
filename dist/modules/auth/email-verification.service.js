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
const nodemailer = require("nodemailer");
const uuid_1 = require("uuid");
const email_util_1 = require("../../utils/email.util");
let EmailVerificationService = EmailVerificationService_1 = class EmailVerificationService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(EmailVerificationService_1.name);
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        this.verifyEmailConfig();
    }
    async verifyEmailConfig() {
        try {
            await this.transporter.verify();
            this.logger.log('✅ Configuration email validée avec succès');
        }
        catch (error) {
            this.logger.error('❌ Erreur configuration email:', error.message);
        }
    }
    async sendVerificationCode(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.email_verified) {
            throw new common_1.HttpException('Email déjà vérifié', common_1.HttpStatus.BAD_REQUEST);
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        user.email_verification_code = code;
        user.email_verification_code_expiry = expiryTime;
        await this.userRepository.save(user);
        await this.sendVerificationCodeEmail(email, code);
        this.logger.log(`Code de vérification envoyé à ${email}`);
        return { message: 'Code de vérification envoyé par email' };
    }
    async verifyCode(email, code) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
        }
        if (!user.email_verification_code || !user.email_verification_code_expiry) {
            throw new common_1.HttpException('Aucun code de vérification trouvé', common_1.HttpStatus.BAD_REQUEST);
        }
        if (new Date() > user.email_verification_code_expiry) {
            throw new common_1.HttpException('Code de vérification expiré', common_1.HttpStatus.BAD_REQUEST);
        }
        if (user.email_verification_code !== code) {
            throw new common_1.HttpException('Code de vérification invalide', common_1.HttpStatus.BAD_REQUEST);
        }
        user.email_verified = true;
        user.email_verification_code = null;
        user.email_verification_code_expiry = null;
        await this.userRepository.save(user);
        this.logger.log(`✅ Email vérifié avec succès pour ${email}`);
        return { message: 'Email vérifié avec succès', email };
    }
    async sendVerificationLink(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.HttpException('Utilisateur non trouvé', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.email_verified) {
            this.logger.warn(`Tentative d'envoi de vérification pour email déjà vérifié: ${email}`);
            return { message: 'Si un compte existe avec cet email, un lien de vérification a été envoyé' };
        }
        const token = (0, uuid_1.v4)();
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 24);
        user.verification_token = token;
        user.verification_token_expiry = expiryTime;
        await this.userRepository.save(user);
        await (0, email_util_1.sendVerificationEmail)(email, token);
        this.logger.log(`✅ Lien de vérification envoyé à ${email}`);
        return { message: 'Un lien de vérification a été envoyé à votre adresse email' };
    }
    async verifyToken(token) {
        this.logger.log(`🔍 Vérification du token: ${token.substring(0, 8)}...`);
        const user = await this.userRepository.findOne({
            where: { verification_token: token }
        });
        if (!user) {
            this.logger.error('❌ Token de vérification invalide ou expiré');
            throw new common_1.HttpException('Token de vérification invalide ou expiré', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!user.verification_token_expiry || new Date() > user.verification_token_expiry) {
            this.logger.error('❌ Token de vérification expiré');
            throw new common_1.HttpException('Token de vérification expiré', common_1.HttpStatus.BAD_REQUEST);
        }
        user.email_verified = true;
        user.verification_token = null;
        user.verification_token_expiry = null;
        await this.userRepository.save(user);
        this.logger.log(`✅ Email vérifié avec succès pour: ${user.email}`);
        return { message: 'Email vérifié avec succès', email: user.email };
    }
    async sendPasswordResetCode(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé' };
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        user.password_reset_code = code;
        user.password_reset_code_expiry = expiryTime;
        await this.userRepository.save(user);
        await this.sendPasswordResetCodeEmail(email, code);
        this.logger.log(`Code de réinitialisation envoyé à ${email}`);
        return { message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé' };
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
        const resetToken = (0, uuid_1.v4)();
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 1);
        user.password_reset_token = resetToken;
        user.password_reset_token_expiry = expiryTime;
        user.password_reset_code = null;
        user.password_reset_code_expiry = null;
        await this.userRepository.save(user);
        this.logger.log(`Code de réinitialisation vérifié pour ${email}`);
        return { message: 'Code vérifié avec succès', resetToken };
    }
    async sendPasswordResetLink(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.log(`Tentative de reset pour email inexistant: ${email}`);
            return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' };
        }
        const resetToken = (0, uuid_1.v4)();
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 1);
        user.password_reset_token = resetToken;
        user.password_reset_token_expiry = expiryTime;
        await this.userRepository.save(user);
        await (0, email_util_1.sendPasswordResetEmail)(email, resetToken);
        this.logger.log(`✅ Lien de réinitialisation envoyé à ${email}`);
        return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé' };
    }
    async sendVerificationCodeEmail(email, code) {
        const mailOptions = {
            from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Code de vérification - Chrono Carto',
            html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de vérification - Chrono Carto</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 30px;">Code de vérification 🔑</h1>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Voici votre code de vérification pour finaliser votre inscription sur Chrono-Carto :
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 30px 0; border: 2px dashed #2563eb;">
              <h2 style="font-size: 36px; color: #2563eb; margin: 0; letter-spacing: 5px; font-family: monospace;">
                ${code}
              </h2>
            </div>
            
            <p style="font-size: 14px; color: #f59e0b; background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              ⏰ <strong>Ce code expire dans 15 minutes</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
              Si vous n'avez pas créé de compte sur Chrono-Carto, veuillez ignorer cet email.
            </p>
          </div>
        </body>
        </html>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Code de vérification envoyé à ${email}`);
        }
        catch (error) {
            this.logger.error(`❌ Erreur envoi code à ${email}:`, error);
            throw new common_1.HttpException('Erreur lors de l\'envoi de l\'email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendPasswordResetCodeEmail(email, code) {
        const mailOptions = {
            from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Code de réinitialisation - Chrono Carto',
            html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de réinitialisation - Chrono Carto</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #dc2626; margin-bottom: 30px;">🔒 Code de réinitialisation</h1>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Voici votre code de réinitialisation pour changer votre mot de passe :
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 30px 0; border: 2px dashed #dc2626;">
              <h2 style="font-size: 36px; color: #dc2626; margin: 0; letter-spacing: 5px; font-family: monospace;">
                ${code}
              </h2>
            </div>
            
            <p style="font-size: 14px; color: #f59e0b; background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              ⏰ <strong>Ce code expire dans 15 minutes</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
              Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email.
            </p>
          </div>
        </body>
        </html>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Code de réinitialisation envoyé à ${email}`);
        }
        catch (error) {
            this.logger.error(`❌ Erreur envoi code reset à ${email}:`, error);
            throw new common_1.HttpException('Erreur lors de l\'envoi de l\'email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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