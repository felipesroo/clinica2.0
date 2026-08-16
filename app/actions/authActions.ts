"use server";

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, setSessionCookie, deleteSessionCookie, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

function checkRateLimit(email: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (attempt && attempt.lockUntil > now) {
    const waitMinutes = Math.ceil((attempt.lockUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  return { allowed: true };
}

function recordFailedAttempt(email: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockUntil = now + 15 * 60000; // 15 minutos de bloqueio
  }
  loginAttempts.set(email, attempt);
}

function resetAttempts(email: string) {
  loginAttempts.delete(email);
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Preencha o e-mail e a senha.' };
  }

  // Rate limiting check
  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    return { error: `Muitas tentativas incorretas. Acesso bloqueado temporariamente. Tente novamente em ${rateLimit.waitMinutes} min.` };
  }

  try {
    // Check if any user exists in database, if not, create default admin
    await ensureDefaultAdminUser();

    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      recordFailedAttempt(email);
      return { error: 'E-mail ou senha incorretos.' };
    }

    const isValid = await verifyPassword(password, user.senhaHash);
    if (!isValid) {
      recordFailedAttempt(email);
      return { error: 'E-mail ou senha incorretos.' };
    }

    resetAttempts(email);

    await setSessionCookie({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      fotoUrl: user.fotoUrl
    });
  } catch (err: any) {
    console.error('Actual login error details:', err?.stack || err);
    return { error: `Erro ao realizar login: ${err?.message || 'Verifique se o usuário e a senha estão corretos.'}` };
  }

  redirect('/');
}

export async function logoutUser() {
  await deleteSessionCookie();
  redirect('/login');
}

export async function getCurrentUser() {
  return await getSession();
}

export async function ensureDefaultAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'jordaneferreirafaria@gmail.com').trim().toLowerCase();
  const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const senhaHash = await hashPassword(rawPassword);

  const existingUser = await prisma.usuario.findUnique({
    where: { email: adminEmail }
  });

  if (!existingUser) {
    await prisma.usuario.create({
      data: {
        nome: 'Dra. Jordane Ferreira Faria',
        email: adminEmail,
        senhaHash,
        role: 'ADMIN',
        fotoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJgqUJmq2CmUG03OfG0psHxEYIuhitDO52_gUwk8F8RZg2NQnbEhYfRLGQ5TidI1PQdXk00Xw7I42dbGfhFFQEO4Lu_WoZOLrCp7W_EXOKVCGjHQURkXvvR3DBTBDmMNMWA8d6IrcaGNCrutj-Skz2IYO8lG4mHVB7QbJOSq9toEYP-ZoPJQP2SX4QDMGSF_Yjnau6N9tAR7Ri2JHMYyGKVZnxkW7YzHBC8m-zSDH28mVq8AKWTzzqFA'
      }
    });
  } else if (process.env.ADMIN_PASSWORD) {
    // If ADMIN_PASSWORD is set explicitly in env, update the password in database
    await prisma.usuario.update({
      where: { id: existingUser.id },
      data: { senhaHash }
    });
  }
}
