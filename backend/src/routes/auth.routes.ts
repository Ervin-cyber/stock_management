import { FastifyInstance } from "fastify";
import bcrypt from 'bcrypt';
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { sendVerificationEmail } from "../utils/mailer";
import crypto from 'crypto';
import { LoginBodySchema, RegisterBodySchema, VerifyEmailBodySchema } from "../types";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function authRoutes(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.post('/login', {
        schema: {
            description: 'Login',
            tags: ['Auth'],
            body: LoginBodySchema
        },
    }, async (
        request
        , reply) => {
        const { email, password } = request.body ?? {};

        if (!email || !password) {
            throw new AppError('Email and password are required!', 400);
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase()
            }
        });

        if (!user || user.deletedAt) {
            throw new AppError('Wrong email or password!', 401);
        }

        if (user && user.active === false) {
            throw new AppError('Your account has been suspended. Please contact the administrator.', 403);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Wrong email or password!', 401);
        }

        const token = typedApp.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, { expiresIn: '1d' }); // jwt expiration 1 day

        reply.send({
            success: true,
            token: token,
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    });

    typedApp.get('/me', {
        schema: {
            description: 'Me',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }],
        },
        onRequest: [typedApp.authenticate]
    }, async (request, reply) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            throw new AppError('User not found!', 404);
        }

        return reply.send({ success: true, user });
    });

    typedApp.post('/register', {
        schema: {
            description: 'Register',
            tags: ['Auth'],
            body: RegisterBodySchema
        },
    }, async (request, reply) => {
        const { email, password, name } = request.body ?? {};

        if (!email || !password || !name) {
            throw new AppError('All fields are required!', 400);
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('This email address is already registered!', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                verificationToken,
                role: 'VIEWER'
            }
        });

        sendVerificationEmail(newUser.email, verificationToken).catch(console.error);

        return reply.status(201).send({
            success: true,
            message: 'Successful registration! Please confirm your email address using the link in the email sent.'
        });
    });

    typedApp.post('/verify-email', {
        schema: {
            description: 'Verify Email',
            tags: ['Auth'],
            body: VerifyEmailBodySchema
        },
    }, async (request, reply) => {
        const { token } = request.body;

        if (!token) {
            throw new AppError('Missing ID token!', 400);
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            throw new AppError('Invalid or already used token!', 400);
        }

        if (user.active) {
            throw new AppError('This account is already active!', 400);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                active: true,
                verificationToken: null
            }
        });

        return reply.send({
            success: true,
            message: 'Your account has been successfully activated! You can now log in.'
        });
    });
}