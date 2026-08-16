# 📜 Dossiê Completo do Sistema — Estética Avançada v2.0
**Gestão Clínica & Estética Avançada**  
*Documento Sanitizado • Sem Dados Pessoais ou Sigilosos*

---

## 🚀 1. Visão Geral da Arquitetura

O sistema **Estética Avançada v2.0** é uma plataforma web completa de gestão clínica e estética avançada.

### 🛠️ Stack Tecnológico:
- **Framework Web:** Next.js 15/16 (App Router & Server Actions)
- **Linguagem:** TypeScript (100% tipado, 0 erros de compilação)
- **Estilização:** TailwindCSS com Design System Luxuoso (Dark Mode, Rose Gold `#E8E0E5`, Vinho/Burgundy `#1C1820`, Verde Sage)
- **Banco de Dados:** PostgreSQL hospedado via Docker / Coolify
- **ORM:** Prisma ORM com Driver Adapter `@prisma/adapter-pg`
- **Autenticação:** JWT (`jose` HS256) + Hashing `bcryptjs` + Google OAuth 2.0
- **Integração de Mensagens:** WAHA (WhatsApp HTTP API) em contêiner Docker na VPS
- **Inteligência Artificial:** OpenAI GPT-4o para agendamento e atendimento automatizado via WhatsApp

---

## 🔒 2. Módulo de Autenticação & Segurança Enterprise

O sistema foi equipado com uma camada de segurança de nível corporativo e bancário.

### 🛡️ Principais Recursos de Segurança:
1. **Controle de Acesso por Usuário (`Usuario` no Banco):**
   - Suporte a administradores e usuários autorizados com papéis (`ADMIN`).
   - Senhas salvas com hash seguro `bcrypt` (10 salt rounds).

2. **Login com E-mail + Senha:**
   - Formulário responsivo com animações suaves e validação em tempo real.
   - Mensagens claras de retorno sem expor detalhes sensíveis do sistema.

3. **Login de 1 Clique com o Google (OAuth 2.0):**
   - Integração direta com a API do Google para autenticação instantânea.
   - **Restrição de E-mails:** O sistema valida a variável `ALLOWED_GOOGLE_EMAILS`. Apenas e-mails autorizados conseguem logar via Google. Tentativas de e-mails desconhecidos são bloqueadas imediatamente.

4. **Sessões Seguras via Cookie HTTP-Only:**
   - Cookie `aura_session` assinado via JWT (HS256) com a chave de alta entropia `JWT_SECRET`.
   - Propriedades de proteção: `httpOnly: true` (protege contra XSS), `sameSite: 'lax'`, `secure: true` em HTTPS.

5. **Middleware de Proteção de Rotas (`middleware.ts`):**
   - Intercepta todas as requisições para telas restritas (`/`, `/pacientes`, `/agendamentos`, `/estoque`, `/relatorios`, `/configuracoes`, `/perfil`).
   - Redireciona usuários não autenticados automaticamente para a tela de login (`/login`).

6. **Proteção Contra Força Bruta (Rate Limiting):**
   - O sistema conta as tentativas incorretas de login por e-mail.
   - Ao atingir **5 erros seguidos**, a conta fica **bloqueada por 15 minutos**.

7. **Cabeçalhos HTTP de Segurança Globais (`next.config.ts`):**
   - `X-Frame-Options: DENY` (Impossibilita o enquadramento em iFrames maliciosos - Anti-Clickjacking).
   - `X-Content-Type-Options: nosniff` (Bloqueia execução de scripts falsos).
   - `Strict-Transport-Security` (HSTS - Força tráfego criptografado HTTPS).
   - `Permissions-Policy` (Bloqueia acesso a câmera, microfone e localização por scripts não autorizados).

8. **Proteção das APIs Internas (`CRON_SECRET` & `SEED_SECRET`):**
   - As rotas de automação (`/api/cron/lembretes`, `/api/cron/lembrete-2h`) e de inicialização (`/api/seed`) exigem obrigatoriamente a validação das chaves secretas para evitar acessos externos.

---

## 🖼️ 3. Logo e Identidade Dinâmica

- **Sincronização Automática:** A logo e o nome da clínica exibidos na tela de Login (`/login`) são puxados dinamicamente das configurações salvas no banco de dados (`settings.logoUrl` e `settings.nomeFantasia`).
- **Atualização em Tempo Real:** Ao alterar a logo da clínica em **Configurações (`/configuracoes`)**, a tela de login e o topo do sistema atualizam instantaneamente.

---

## 📲 4. Módulo de Automações & WhatsApp (WAHA)

### 💬 Comunicação via WhatsApp:
- Instância do **WAHA (WhatsApp HTTP API)** configurada no servidor Docker.
- Autenticação por API Key única.

### ⏰ Lembretes Automáticos de Consulta:
1. **Lembrete de Véspera (Disparo às 08:00):**
   - Envia mensagem no dia anterior confirmando data e horário do procedimento.
2. **Lembrete de 2 Horas Antes:**
   - Envia aviso automático para o paciente 2 horas antes do horário agendado.

---

## 🔑 5. Variáveis de Ambiente (`.env.example`)

Abaixo está o modelo de variáveis configuradas no arquivo `.env`:

| Variável | Descrição | Modelo / Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de Conexão com o PostgreSQL | `postgresql://SEU_USUARIO:SUA_SENHA@SEU_HOST:5432/BANCO?schema=public` |
| `GOOGLE_CLIENT_ID` | ID de Cliente OAuth do Google | `SEU_GOOGLE_CLIENT_ID.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Segredo do Cliente OAuth do Google | `SEU_GOOGLE_CLIENT_SECRET` |
| `ADMIN_EMAIL` | E-mail do Administrador Padrão | `seu_email_admin@exemplo.com` |
| `ADMIN_PASSWORD` | Senha do Administrador Padrão | `SUA_SENHA_ADMIN_FORTE` |
| `ALLOWED_GOOGLE_EMAILS` | Lista de E-mails Autorizados no Google | `seu_email@exemplo.com,outro_email@exemplo.com` |
| `JWT_SECRET` | Chave de Assinatura das Sessões JWT | `SUA_CHAVE_SECRETA_JWT_MUITO_FORTE` |
| `CRON_SECRET` | Chave de Proteção do Robô de Lembretes | `SUA_CHAVE_SECRETA_CRON` |
| `SEED_SECRET` | Chave de Proteção da Rota de Inicialização | `SUA_CHAVE_SECRETA_SEED` |
| `WAHA_API_KEY` | Chave de Autenticação da API WAHA | `SUA_WAHA_API_KEY` |

---

## 📊 6. Módulos e Funcionalidades Principais do Sistema

1. **Dashboard (`/`):**
   - Métricas de faturamento mensal e atendimentos do dia.
   - Lista de próximos pacientes e atalhos rápidos para novo agendamento.
2. **Agendamentos (`/agendamentos`):**
   - Calendário visual por dia e semana.
   - Integração bidirecional com Google Calendar e disparo de confirmações via WhatsApp.
3. **Clientes / Prontuário (`/clientes` & `/clientes/perfil`):**
   - Cadastro detalhado de paciente, histórico médico e alergias.
   - **Galeria de Evolução:** Exibição de fotos de tratamentos com modal de Zoom/Expansão e botão de **"Baixar Imagem"**.
4. **Estoque (`/estoque`):**
   - Controle de produtos, toxinas, preenchedores e insumos da clínica.
   - Movimentações de entrada/saída e indicação de estoque crítico.
5. **Relatórios (`/relatorios`):**
   - Gráficos de receita, procedimentos mais vendidos e fluxo de caixa.
6. **Configurações (`/configuracoes`):**
   - Gestão dos dados da clínica, logo oficial, textos de mensagens do WhatsApp, API Key da OpenAI e regras do Agente de IA.

---
*Dossiê higienizado elaborado para acompanhamento técnico e arquivamento seguro.*
