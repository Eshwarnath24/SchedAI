/**
 * mail/MailService.js
 *
 * Drop-in equivalent of @nestjs-modules/mailer with the Handlebars adapter.
 *
 * Features:
 *  • Configures Nodemailer with SMTP credentials from environment variables.
 *  • Compiles Handlebars (.hbs) templates from  mail/templates/
 *  • Exposes a single  sendEmail({ to, subject, template, context })  method
 *    that mirrors the NestJS MailerService API.
 *
 * Environment variables required in your .env file:
 *  MAIL_HOST     - SMTP host            e.g. smtp.gmail.com
 *  MAIL_PORT     - SMTP port            e.g. 587
 *  MAIL_SECURE   - "true" for port 465, "false" for STARTTLS (port 587)
 *  MAIL_USER     - SMTP username / sender email
 *  MAIL_PASS     - SMTP password or app-password
 *  MAIL_FROM     - Display name + address  e.g. "SchedAI <no-reply@schedai.edu>"
 */

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// ─── Template directory ────────────────────────────────────────────────────────
const TEMPLATE_DIR = path.join(__dirname, 'templates');

// ─── In-memory template cache  (compile once, reuse on every send) ────────────
const templateCache = {};

/**
 * Reads and compiles a Handlebars template from disk.
 * Results are cached so the file system is only hit once per template name.
 *
 * @param {string} templateName  - Filename WITHOUT the .hbs extension
 * @returns {HandlebarsTemplateDelegate}
 */
const getCompiledTemplate = (templateName) => {
    if (templateCache[templateName]) {
        return templateCache[templateName];
    }

    const filePath = path.join(TEMPLATE_DIR, `${templateName}.hbs`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`[MailService] Template not found: ${filePath}`);
    }

    const source = fs.readFileSync(filePath, 'utf8');
    const compiled = handlebars.compile(source);

    templateCache[templateName] = compiled;
    return compiled;
};

// ─── Nodemailer transporter (lazy singleton) ──────────────────────────────────
let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    _transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        family: 4, // FORCE IPv4
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    return _transporter;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * sendEmail — generic mail sender.
 *
 * Mirrors the NestJS MailerService.sendMail() signature so this service can be
 * swapped back to @nestjs-modules/mailer with minimal refactoring.
 *
 * @param {Object}        options
 * @param {string|string[]} options.to       - Recipient address(es)
 * @param {string}          options.subject  - Email subject line
 * @param {string}          options.template - Template name (no .hbs extension)
 * @param {Object}          options.context  - Data passed into the Handlebars template
 *
 * @returns {Promise<Object>} Nodemailer info object
 *
 * @example
 * await MailService.sendEmail({
 *   to:       'faculty@cse.cb.amrita',
 *   subject:  'Class Cancellation — Confirmed',
 *   template: 'faculty-confirmation',
 *   context:  { facultyName: 'Dr. Smith', courseName: 'Data Structures', cancelDate: '2026-03-15' },
 * });
 */
const sendEmail = async ({ to, subject, template, context }) => {
    try {
        const compiledTemplate = getCompiledTemplate(template);
        const html = compiledTemplate(context);

        // If MAIL_OVERRIDE_TO is set, redirect ALL emails to that address (for testing)
        const overrideTo = process.env.MAIL_OVERRIDE_TO;
        const actualTo = overrideTo || (Array.isArray(to) ? to.join(', ') : to);

        if (overrideTo) {
            console.log(`[MailService] 📧 Override active — redirecting "${to}" → "${overrideTo}"`);
        }

        const mailOptions = {
            from: process.env.MAIL_FROM || `"SchedAI" <${process.env.MAIL_USER}>`,
            to: actualTo,
            subject,
            html,
        };

        const info = await getTransporter().sendMail(mailOptions);
        console.log(`[MailService] ✅ Email sent → ${mailOptions.to} | messageId: ${info.messageId}`);
        return info;

    } catch (error) {
        // Log but do NOT re-throw — a mail failure should never crash the request
        console.error(`[MailService] ❌ Failed to send "${template}" to "${to}":`, error.message);
        throw error;   // re-throw so the caller (NotificationListener) can catch and log
    }
};

module.exports = { sendEmail };
