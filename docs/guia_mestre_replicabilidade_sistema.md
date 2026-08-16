# 📐 Guia Mestre de Engenharia & Replicabilidade Total
## Sistema de Gestão Clínica & Estética Avançada v2.0
**Manual de Referência Sanitizado • Sem Informações Pessoais ou Sigilosas**  
*Documento de Referência Técnica para Desenvolvedores e Sistemas de Inteligência Artificial*

---

## 🎯 1. Visão Geral e Conceito do Sistema

O **Estética Avançada v2.0** é um ERP e CRM médico-estético completo de alto padrão, focado em alta performance, usabilidade móvel/desktop, automação de comunicação por WhatsApp e inteligência artificial para atendimento ao paciente.

### 🎨 Conceito Visual (Design System Luxuoso):
- **Paleta de Cores:**
  - **Fundo Escuro Principais:** `#121014` (Deep Charcoal), `#1C1820` (Vinho/Burgundy Noturno)
  - **Destaques Rose Gold / Champagne:** `#E8E0E5`, `#F5E6EC`, `#C8B2BC`
  - **Verde Sage (Estoque/Status):** `#2D3A32`, `#A3C9A8`
  - **Feedback/Alerta:** `#FF5449` (Erro), `#4ECDC4` (Sucesso)
- **Tipografia:** Serifada para títulos principais (`font-serif`, ex: *Playfair Display* / *Cinzel*) e sans-serif limpa para interface (`font-sans`, *Inter* / *Outfit*).
- **Efeitos de UI:** Glassmorphism (`backdrop-blur-xl`), bordas finas semi-transparentes (`border-white/10`), micro-animações em botões e modais de lightbox com zoom.

---

## 🛠️ 2. Arquitetura Tecnológica Completa

| Camada | Tecnologia Utilizada | Versão / Detalhes |
| :--- | :--- | :--- |
| **Frontend & Backend** | Next.js (App Router) | 15 / 16 (React 19, Server Actions, Edge Middleware) |
| **Linguagem** | TypeScript | Strict Type Checking (0 erros no `tsc --noEmit`) |
| **Estilização** | TailwindCSS + Vanilla CSS | Design System com Tokens HSL Customizados |
| **Banco de Dados** | PostgreSQL 16 | Containerizado no Docker via Coolify / PaaS |
| **ORM** | Prisma ORM | v6 / v7 com `@prisma/adapter-pg` e Pool nativo `pg` |
| **Autenticação** | JWT (`jose`) + `bcryptjs` + Google OAuth | Cookie HTTP-Only `aura_session` + OAuth 2.0 |
| **Mensageria WhatsApp** | WAHA (WhatsApp HTTP API) | Contêiner Docker `devlikepro/waha:latest` |
| **Inteligência Artificial** | OpenAI API (GPT-4o) | Atendimento e agendamento conversacional autônomo |
| **Infraestrutura / PaaS** | Coolify Self-Hosted / Docker | VPS Linux, NGINX Reverse Proxy, SSL Let's Encrypt |

---

## 🗄️ 3. Estrutura do Banco de Dados (Prisma Schema)

Salvo em `prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../app/generated/prisma/client"
  binaryTargets = ["native", "debian-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id        String   @id @default(uuid())
  nome      String
  email     String   @unique
  senhaHash String
  role      String   @default("ADMIN")
  fotoUrl   String?
  googleId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Cliente {
  id                String        @id @default(uuid())
  nome              String
  email             String?
  telefone          String?
  dataCadastro      DateTime      @default(now())
  alergias          String?
  avatarUrl         String?
  dataNascimento    String?
  objetivoPrincipal String?
  tipoPele          String?
  agendamentos      Agendamento[]
  fotosEvolucao     ClienteFoto[]
}

model ClienteFoto {
  id        String   @id @default(uuid())
  clienteId String
  url       String   // Suporta Base64 ou URL de imagem
  legenda   String?
  data      DateTime @default(now())
  cliente   Cliente  @relation(fields: [clienteId], references: [id], onDelete: Cascade)
}

model Agendamento {
  id             String    @id @default(uuid())
  date           String    // YYYY-MM-DD
  startTime      String    // HH:mm
  duration       Int       @default(60)
  service        String
  status         String    @default("AGENDADO")
  googleEventId  String?
  valor          String?
  formaPagamento String?
  numeroParcelas Int?
  clienteId      String
  cliente        Cliente   @relation(fields: [clienteId], references: [id], onDelete: Cascade)
}

model Procedimento {
  id      String @id @default(uuid())
  nome    String
  duracao Int    @default(60)
  preco   Float  @default(0)
  cor     String @default("bg-primary")
}

model EstoqueProduto {
  id            String               @id @default(uuid())
  nome          String
  categoria     String               @default("Insumo")
  quantidade    Int                  @default(0)
  qtdMinima     Int                  @default(5)
  unidade       String               @default("un")
  precoCusto    Float                @default(0)
  precoVenda    Float                @default(0)
  lote          String?
  validade      String?
  movimentacoes EstoqueMovimentacao[]
}

model EstoqueMovimentacao {
  id        String         @id @default(uuid())
  produtoId String
  tipo      String         // ENTRADA | SAIDA
  quantidade Int
  motivo    String?
  data      DateTime       @default(now())
  produto   EstoqueProduto @relation(fields: [produtoId], references: [id], onDelete: Cascade)
}

model Configuracao {
  id                  String  @id @default("1")
  nomeFantasia        String  @default("Estética Avançada")
  razaoSocial         String  @default("Clínica de Estética Avançada LTDA")
  cnpj                String  @default("")
  inscricaoMun        String  @default("")
  email               String  @default("contato@suaclinica.com.br")
  whatsapp            String  @default("(11) 99999-9999")
  cep                 String  @default("01415-000")
  endereco            String  @default("Endereço da Clínica")
  logoUrl             String  @default("https://via.placeholder.com/150")
  bairro              String  @default("Bairro")
  cidade              String  @default("Cidade")
  estado              String  @default("UF")
  instagram           String  @default("instagram.com/suaclinica")
  googleRefreshToken  String?
  googleCalendarId    String?
  wahaUrl             String?
  wahaSessionName     String?
  msgConfirmacaoAtiva Boolean @default(true)
  msgConfirmacaoTexto String  @default("Olá, {nome}! 🌸 Seu agendamento de *{servico}* foi confirmado...")
  msgLembreteAtiva    Boolean @default(true)
  msgLembreteTexto    String  @default("Oi, {nome}! 😊 Passando para lembrar...")
  msgHoraLembrete     String  @default("08:00")
  msgLembrete2hAtiva  Boolean @default(true)
  msgLembrete2hTexto  String  @default("Oi, {nome}! ⏰ Lembrete: em 2 horas...")
  openAiApiKey        String?
  openAiSystemPrompt  String? @default("Você é a assistente virtual da clínica...")
  aiAgentActive       Boolean @default(false)
  aiAutoSchedule      Boolean @default(false)
}
```

---

## 🔐 4. Módulo de Autenticação e Segurança (Códigos-Chave)

### A. Gerenciamento de Sessão (`lib/auth.ts`)
```ts
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'CHAVE_SECRETA_JWT_PADRAO_GERADA_DE_ALTA_ENTROPIA'
);
export const SESSION_COOKIE_NAME = 'aura_session';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(user: any): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function setSessionCookie(user: any) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}
```

### B. Middleware de Proteção de Rotas (`middleware.ts`)
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'CHAVE_SECRETA_JWT_PADRAO_GERADA_DE_ALTA_ENTROPIA'
);

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/seed', '/api/webhooks', '/api/cron'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('aura_session')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('aura_session');
    return response;
  }
}
```

### C. Rate Limiting e Login (`app/actions/authActions.ts`)
```ts
"use server";
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, setSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

export async function loginUser(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  const now = Date.now();
  const attempt = loginAttempts.get(email);
  if (attempt && attempt.lockUntil > now) {
    const waitMin = Math.ceil((attempt.lockUntil - now) / 60000);
    return { error: `Muitas tentativas incorretas. Bloqueado por ${waitMin} min.` };
  }

  try {
    await ensureDefaultAdminUser();
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.senhaHash))) {
      const cur = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
      cur.count += 1;
      if (cur.count >= 5) cur.lockUntil = now + 15 * 60000;
      loginAttempts.set(email, cur);
      return { error: 'E-mail ou senha incorretos.' };
    }

    loginAttempts.delete(email);
    await setSessionCookie({ id: user.id, nome: user.nome, email: user.email, role: user.role });
  } catch (err: any) {
    return { error: 'Erro ao realizar login.' };
  }

  redirect('/');
}
```

### D. Autenticação Restrita com o Google OAuth (`app/api/auth/google/login/callback/route.ts`)
```ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/google/login/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const { tokens } = await oauth2Client.getToken(code!);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data: googleUser } = await oauth2.userinfo.get();
  const userEmail = googleUser.email!.toLowerCase();

  // Validação estrita por whitelist
  const allowedEnv = process.env.ALLOWED_GOOGLE_EMAILS;
  if (allowedEnv) {
    const allowedList = allowedEnv.split(',').map(e => e.trim().toLowerCase());
    if (!allowedList.includes(userEmail)) {
      return NextResponse.redirect(new URL(`/login?error=Nao_autorizado`, request.url));
    }
  }

  let user = await prisma.usuario.findFirst({
    where: { OR: [{ googleId: googleUser.id }, { email: userEmail }] }
  });

  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-10);
    user = await prisma.usuario.create({
      data: {
        nome: googleUser.name || 'Usuário Google',
        email: userEmail,
        senhaHash: await hashPassword(randomPassword),
        googleId: googleUser.id,
        fotoUrl: googleUser.picture || null,
        role: 'ADMIN'
      }
    });
  }

  await setSessionCookie({ id: user.id, nome: user.nome, email: user.email, role: user.role });
  return NextResponse.redirect(new URL('/', request.url));
}
```

---

## 📡 5. Integração WAHA & Automações de Lembrete

### A. API de Mensagens WhatsApp (`lib/whatsapp.ts`)
```ts
export async function sendWhatsAppMessage(to: string, text: string) {
  const wahaUrl = process.env.WAHA_URL || 'http://localhost:3005';
  const apiKey = process.env.WAHA_API_KEY || 'SUA_WAHA_API_KEY';

  let cleanPhone = to.replace(/\D/g, '');
  if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone;
  const chatId = `${cleanPhone}@c.us`;

  const response = await fetch(`${wahaUrl}/api/sendText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      session: 'default',
      chatId: chatId,
      text: text,
    }),
  });

  return await response.json();
}
```

### B. Proteção das Rotas de Cron (`/api/cron/lembretes/route.ts`)
```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET || 'SUA_CHAVE_SECRETA_CRON';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Executa busca de agendamentos e envia lembretes pelo WAHA...
}
```

---

## 📋 6. Dicionário de Modelo das Variáveis de Ambiente (`.env.example`)

```env
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@SEU_HOST:5432/NOME_BANCO?schema=public"

# Google Cloud OAuth 2.0
GOOGLE_CLIENT_ID="SEU_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="SEU_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="https://seu-dominio.com/api/auth/google/login/callback"

# Autenticação e Administrador Padrão
ADMIN_EMAIL="seu_email_admin@exemplo.com"
ADMIN_PASSWORD="SUA_SENHA_ADMIN_FORTE"
ALLOWED_GOOGLE_EMAILS="seu_email_admin@exemplo.com,outro_email_autorizado@exemplo.com"

# Segredos de Segurança (256-bit High Entropy)
JWT_SECRET="SUA_CHAVE_SECRETA_JWT_MUITO_FORTE"
CRON_SECRET="SUA_CHAVE_SECRETA_CRON"
SEED_SECRET="SUA_CHAVE_SECRETA_SEED"

# WAHA WhatsApp Engine API Key
WAHA_API_KEY="SUA_WAHA_API_KEY"
```

---

## 🚀 7. Roteiro Passo a Passo para Replicar o Sistema do Zero

Caso um desenvolvedor ou sistema de IA precise recriar este projeto do zero em um novo ambiente ou servidor:

### Passo 1: Inicialização do Projeto Next.js
```bash
npx create-next-app@latest projeto_clinica --typescript --tailwind --app --use-npm
cd projeto_clinica
```

### Passo 2: Instalação das Dependências Principais
```bash
npm install @prisma/client @prisma/adapter-pg pg bcryptjs jose googleapis openai
npm install -D prisma @types/bcryptjs @types/pg
```

### Passo 3: Configuração do Banco de Dados PostgreSQL & Prisma
1. Crie o arquivo `prisma/schema.prisma` com a estrutura fornecida na Seção 3.
2. Execute o push da estrutura e geração do cliente tipado:
```bash
npx prisma db push
npx prisma generate
```

### Passo 4: Implementação dos Módulos Principais
1. Copie e cole os arquivos de utilidade em `lib/auth.ts`, `lib/prisma.ts`, `lib/whatsapp.ts`, `lib/openai.ts`.
2. Crie a proteção global em `middleware.ts`.
3. Implemente os Server Actions em `app/actions/`.
4. Crie a página de login em `app/login/page.tsx` com a chamada ao `getSettings()` para renderizar a logo e nome dinâmicos.

### Passo 5: Implantação no Servidor (Docker + Coolify)
1. Suba uma instância Linux (Ubuntu Server).
2. Instale o Coolify PaaS (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`).
3. Crie a aplicação Next.js no Coolify conectada ao repositório GitHub.
4. Adicione o contêiner do WAHA (`devlikepro/waha:latest`) na porta `3005`.
5. Preencha as Variáveis de Ambiente no painel do Coolify conforme o modelo da Seção 6.

### Passo 6: Configuração no Google Cloud Console
No painel do Google Auth Platform ([console.cloud.google.com](https://console.cloud.google.com)):
Adicione as URIs em **"URIs de redirecionamento autorizados"**:
- `https://seu-dominio.com/api/auth/google/login/callback` (Login em Produção)
- `https://seu-dominio.com/api/auth/google/callback` (Agenda em Produção)
- `http://localhost:3000/api/auth/google/login/callback` (Login em Desenvolvimento)
- `http://localhost:3000/api/auth/google/callback` (Agenda em Desenvolvimento)

### Passo 7: Inicialização dos Dados (Seed)
Acesse a URL de seed com a chave secreta:
```http
GET https://seu-dominio.com/api/seed?secret=SUA_CHAVE_SECRETA_SEED
```
O banco criará a tabela `Usuario`, cadastrará a conta master e carregará todos os procedimentos, modelos de mensagens e configurações padrão.

---

## 📌 8. Checklist de Validação Final

- [x] Login por e-mail e senha funcionando com hash `bcrypt`.
- [x] Login do Google validando contra a whitelist `ALLOWED_GOOGLE_EMAILS`.
- [x] Bloqueio automático por Rate Limiting (5 erros seguidos → 15 min de trava).
- [x] Proteção das rotas privadas no Middleware com JWT em cookie HTTP-Only.
- [x] Cabeçalhos de segurança HTTP configurados (`X-Frame-Options: DENY`, HSTS, `nosniff`).
- [x] Galeria de evolução com Lightbox Zoom e botão "Baixar Imagem".
- [x] Logo e nome da clínica 100% dinâmicos a partir das Configurações.
- [x] Integração WAHA e disparo automatizado de lembretes via Cron.
- [x] Deploy sincronizado no GitHub e servidor em produção.

---
*Este documento serve como o Manual Sanitizado de Engenharia e Arquitetura do Sistema Estética Avançada v2.0.*
