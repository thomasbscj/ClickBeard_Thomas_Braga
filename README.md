# ClickBeard - Sistema de Agendamento para Barbearia

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Features](#features)
- [Stack Técnico](#stack-técnico)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Setup](#instalação-e-setup)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Arquitetura do Backend](#arquitetura-do-backend)
- [Arquitetura do Frontend](#arquitetura-do-frontend)
- [Segurança](#segurança)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Estrutura de Dados](#estrutura-de-dados)
- [Regras de Negócio](#regras-de-negócio)
- [Documentação de API](#documentação-de-api)
- [Testes](#testes)
- [Docker](#docker)

---

## Visão Geral

ClickBeard é um **Sistema de Agendamento para Barbearia** desenvolvido com arquitetura moderna, segura e escalável. O sistema permite que clientes façam agendamentos com barbeiros específicos e especialidades, enquanto administradores gerenciam o negócio completo.

### Principais Características:

- Autenticação e autorização com JWT stateless
- Controle de acesso baseado em papéis (RBAC)
- Dashboard dinâmico e reativo
- Validação rigorosa em frontend e backend
- Segurança de dados com criptografia bcrypt (2^13 iterações)
- Cookies HTTP-only para refresh tokens
- Padrão REST com CORS controlado
- Zero confiança no frontend (validação em backend)
- Política de acesso mínimo (least privilege)
- UI simples, mas intuitiva devido ao prazo apertado

---

## Arquitetura

### Visão Geral

O projeto segue uma arquitetura **Domain-Driven Design (DDD)** com baixíssimo acoplamento:

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)               │
│         Páginas Dinâmicas | Dashboards | Auth       │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS/HTTP
                     │ CORS Controlado
┌────────────────────▼────────────────────────────────┐
│                 Backend (Express.js)                │
├─────────────────────────────────────────────────────┤
│ Controllers → Services → Repositories → Database    │
│ (Interfaces como adaptadores entre camadas)         │
└─────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│         Database (PostgreSQL + Prisma ORM)          │
│     Migrations | Schema | Constraints               │
└─────────────────────────────────────────────────────┘
```

### Princípios de Arquitetura

- **Separação de Responsabilidades**: Controllers, Services, Repositories
- **Inversão de Controle**: Dependências injetadas via interfaces
- **DDD**: Lógica de negócio isolada em services
- **Stateless JWT**: Sem estado de sessão no servidor
- **Zero Confiança**: Validação em todas as camadas

---

## Features

### Autenticação

- Cadastro de clientes (nome, e-mail, senha)
- E-mail único e validado
- Login com JWT (stateless)
- Refresh token com expiração de 7 dias
- Apenas usuários autenticados acessam agendamentos
- Logout seguro com invalidação de refresh tokens

### Gestão de Barbeiros

- Cadastro de barbeiros (nome, idade, data de contratação)
- Cada barbeiro pode ter múltiplas especialidades
- Relacionamento muitos-para-muitos otimizado
- Validação de dados em tempo real

### Especialidades

- Cadastro de especialidades (sobrancelha, corte tesoura, barba, etc.)
- Descrição detalhada de cada especialidade
- Interface dinâmica de seleção

### Agendamentos

- Horários: todos os dias, 8h às 18h
- Duração: 30 minutos por atendimento
- Cliente escolhe: especialidade → barbeiro → horário
- Visualização de agendamentos pessoais
- Cancelamento até 2 horas antes
- Atualização dinâmica de disponibilidade

### Painel Administrativo

- Visualizar agendamentos do dia atual
- Visualizar agendamentos futuros
- Visualizar histórico de agendamentos
- Gerenciar usuários (CRUD)
- Acesso exclusivo com validação em backend (RBAC)

---

## Stack Técnico

### Backend

| Componente       | Tecnologia | Propósito        |
| ---------------- | ---------- | ---------------- |
| **Runtime**      | Node.js    | Execução         |
| **Framework**    | Express.js | API REST         |
| **Linguagem**    | TypeScript | Type-safety      |
| **Database**     | PostgreSQL | Persistência     |
| **ORM**          | Prisma     | Abstração BD     |
| **Autenticação** | JWT        | Tokens           |
| **Hash**         | bcrypt     | Criptografia     |
| **Validação**    | Zod        | Schemas          |
| **Testing**      | Vitest     | Testes unitários |
| **CORS**         | cors       | Cross-origin     |

### Frontend

| Componente      | Tecnologia   | Propósito       |
| --------------- | ------------ | --------------- |
| **Framework**   | Next.js      | React Framework |
| **Linguagem**   | TypeScript   | Type-safety     |
| **Styling**     | Tailwind CSS | Utilitários CSS |
| **HTTP Client** | Axios        | Requisições     |
| **Cookies**     | js-cookie    | Gerenciamento   |
| **UI**          | React 19     | Componentes     |

---

## Pré-requisitos

- **Node.js** 18 ou superior
- **npm**
- **PostgreSQL** 14 ou superior
- **Docker** e **Docker Compose**
- **Git**

---

## Instalação e Setup

### 1. Clonar o Repositório

```bash
git clone https://github.com/thomasbscj/ClickBeard_Thomas_Braga.git
cd ClickBeard_Thomas_Braga
```

### 2. Setup do Backend

```bash
cd api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp example.env .env
# Editar .env com suas credenciais

# Executar migrações
npx prisma migrate deploy

# Compilar TypeScript
npm run build
```

### 3. Setup do Frontend

```bash
cd ../ui/click-beard-t-braga

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp example.env .env.local
# Editar .env.local com URL da API

# Build (opcional)
npm run build
```

### 4. Criar Usuário Admin

Após executar as migrações, você precisa criar um usuário admin para acessar o painel administrativo.

#### Opção A: Se o banco está em Docker

```bash
# Na raiz do projeto, com docker-compose rodando

# Executar psql dentro do container PostgreSQL
docker exec -it <container-postgres-name> psql -U postgres -d clickbeard_db

# Para descobrir o nome do container, execute:
docker ps

# Dentro do psql, execute:
INSERT INTO "User" (email, credential, name, role)
VALUES (
  'admin@email.com',
  '$2a$06$4beoXeyTxLmjELZqu1yLt.Vn613jU1EEFDhC1e5/2OZos0XrnJz2C',
  'admin',
  'admin'
);

# Verificar se foi criado
SELECT * FROM "User" WHERE email = 'admin@email.com';

# Sair do psql
\q
```

#### Opção B: Se o PostgreSQL está localmente

```bash
# Conectar ao banco localmente
psql -U postgres -d clickbeard_db

# Executar a mesma query acima
INSERT INTO "User" (email, credential, name, role)
VALUES (
  'admin@email.com',
  '$2a$06$4beoXeyTxLmjELZqu1yLt.Vn613jU1EEFDhC1e5/2OZos0XrnJz2C',
  'admin',
  'admin'
);
```

**Credenciais do admin criado:**

- Email: `admin@email.com`
- Senha: `senha`

---

## Variáveis de Ambiente

### Backend (`api/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clickbeard_db"

# JWT
JWT_SECRET="sua_chave_secreta_muito_longa_e_forte"
JWT_EXPIRY="15m"

# Server
PORT=8080
NODE_ENV="development"

# CORS
FRONTEND_URL="http://<seu ip local>:3000"
```

Usar localhost pode interferir no CORS

### Frontend (`ui/click-beard-t-braga/.env.local`)

```env
# API
NEXT_PUBLIC_API_URL="http://<seu ip local>:8080/api"
NEXT_PUBLIC_API_TIMEOUT=10000
```

Usar localhost pode interferir no CORS

## Executando o Projeto

**Terminal 1 - Backend:**

```bash
cd api
npm run build
npm start
# API rodando em http://localhost:8080
```

**Terminal 2 - Frontend:**

```bash
cd ui/click-beard-t-braga
npm run start
# Frontend rodando em http://localhost:3000
```

### Terminal 3: Docker Compose - PostgreSQL

```bash
# Na raiz do projeto
docker compose up
```

---

## Arquitetura do Backend

### Padrão em Camadas

```
Controller
    ↓ (DTOs)
Service (Lógica de Negócio)
    ↓ (Interfaces)
Repository (Persistência)
    ↓
Prisma Client
    ↓
PostgreSQL
```

### Estrutura de Diretórios

```
src/
├── auth/                    # Autenticação e Autorização
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.model.ts
│   └── refreshToken.repository.ts
├── user/                    # Gestão de Usuários
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.model.ts
│   └── user.repository.ts
├── barber/                  # Gestão de Barbeiros
│   ├── barber.controller.ts
│   ├── barber.service.ts
│   ├── barber.model.ts
│   └── barber.repository.ts
├── specialty/               # Gestão de Especialidades
│   ├── specialty.controller.ts
│   ├── specialty.service.ts
│   ├── specialty.model.ts
│   └── specialty.repository.ts
├── appointment/             # Gestão de Agendamentos
│   ├── appointment.controller.ts
│   ├── appointment.service.ts
│   ├── appointment.model.ts
│   └── appointment.repository.ts
├── middleware/
│   ├── authMiddleware.ts    # Validação JWT
│   └── adminMiddleware.ts   # Validação RBAC
├── repository/
│   └── repository.ts        # Interfaces base
├── types/
│   └── types.ts             # Tipos TypeScript compartilhados
├── utils/
│   ├── errorHandler.ts      # Tratamento de erros
│   └── paramParser.ts       # Parse de parâmetros
└── generated/
    └── prisma/              # Tipos gerados pelo Prisma
```

### Padrão de Implementação: User Service

```typescript
// Estrutura: Repository → Service → Controller

// 1. Repository (Abstração de dados)
interface IUserRepository {
  findById(id: number): Promise<User>;
  create(user: User): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
}

// 2. Service (Lógica de negócio)
class UserService {
  constructor(private repository: IUserRepository) {}

  async getUserById(id: number): Promise<UserSecure> {
    const user = await this.repository.findById(id);
    return this.removePassword(user);
  }
}

// 3. Controller (Requisições HTTP)
router.get("/users/:id", authMiddleware, (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
});
```

### Fluxo de Requisição

```
1. HTTP Request → Router
2. Middleware (Auth, CORS, etc.)
3. Controller (Parse, DTOs)
4. Service (Validação, Negócio)
5. Repository (Persistência)
6. Prisma (ORM)
7. PostgreSQL (Dados)
8. ← Response (JSON + HTTP Status)
```

---

## Arquitetura do Frontend

### Estrutura de Diretórios

```
ui/click-beard-t-braga/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── appointments/
│   ├── admin/                 # Painel Administrativo
│   │   ├── page.tsx
│   │   ├── appointments/
│   │   ├── barbers/
│   │   ├── specialties/
│   │   └── users/
│   ├── api/
│   │   └── check-auth/        # Endpoint interno
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
├── axios/
│   ├── index.ts               # Configuração Axios
│   └── calls.ts               # Funções de API
├── lib/
│   └── jwt.ts                 # Utilitários JWT
└── public/
    └── assets
```

### Padrão Next.js

- **App Router**: Roteamento moderna com segmentos
- **Groups de Layout**: `(auth)`, `(dashboard)` isolam layouts
- **Middleware**: Validação de autenticação
- **API Routes**: Endpoints internos (check-auth)

### Fluxo de Páginas

```
/login               → Páginas públicas
/register
    ↓
(autenticação bem-sucedida)
    ↓
/                    → Dashboard pessoal
/appointments        → Listar agendamentos
/admin               → Painel admin (apenas ADMIN)
/logout              → Limpar tokens
```

### Recursos Dinâmicos

- Atualização de horários disponíveis em tempo real
- Validação de entrada com feedback imediato
- Estados mínimos para performance
- UX intuitiva com redirecionamentos automáticos
- CORS controlado no frontend

---

## Segurança

### Estratégias Implementadas

#### 1. **Autenticação JWT Stateless**

```typescript
// Geração de token
const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
  expiresIn: "15m",
});

// Validação em cada requisição
const verified = jwt.verify(token, JWT_SECRET);
```

- Tokens expiram em **15 minutos**
- Sem estado no servidor (stateless)
- Payload imutável

#### 2. **Refresh Token com Cookies HTTP-only**

```typescript
// Armazenado em cookie seguro
res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: true, // HTTPS apenas
  sameSite: "strict", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

- **HTTP-only**: Inacessível para JavaScript (XSS protection)
- **Secure**: Apenas HTTPS em produção
- **SameSite**: Proteção contra CSRF
- **7 dias de expiração**: Renovação frequente

#### 3. **Criptografia Bcrypt**

```typescript
// Senha com 2^13 (8192) iterações
const hashedPassword = await bcrypt.hash(password, 13);

// Verificação segura (timing-safe)
const isValid = await bcrypt.compare(plaintext, hash);
```

- **2^13 iterações**: Forte contra força bruta
- **Timing-safe**: Resistente a timing attacks

#### 4. **Validação Rigorosa**

```typescript
// Zod schemas para validação
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Validação em:
// ✓ Frontend (UX)
// ✓ Backend (Segurança)
```

**Zero confiança no frontend**: Backend valida todos os dados

#### 5. **CORS Controlado**

```typescript
// Backend
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

// Frontend
axios.defaults.withCredentials = true;
```

#### 6. **RBAC (Role-Based Access Control)**

```typescript
// Middleware de autorização
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Aplicado em todas as rotas admin
router.delete('/users/:id', authMiddleware, adminMiddleware, ...);
```

#### 7. **Política de Acesso Mínimo**

- Cada role tem permissões específicas
- USER: Acessa apenas seus agendamentos
- ADMIN: Acesso total
- Não-autenticado: Apenas /auth/\*

#### 8. **Proteção contra Ataques Comuns**

| Ataque              | Proteção                            |
| ------------------- | ----------------------------------- |
| XSS                 | HTTP-only cookies, CSP headers      |
| CSRF                | SameSite cookies, CORS validation   |
| SQL Injection       | Prisma (ORM parameterizado)         |
| Brute Force         | Bcrypt com 2^13 iterações           |
| Token Hijacking     | HTTP-only + HTTPS + expiração curta |
| Unauthorized Access | JWT + RBAC middleware               |

## Fluxo de Autenticação


### 1. Registro (Sign Up)

```
[Cliente]
    ↓
POST /auth/register
├─ Validação de dados (Zod)
├─ Verificar email único
├─ Hash senha (bcrypt, 2^13)
├─ Criar usuário (role=USER)
└─ Retornar: { message, email }

Nota: Não retorna tokens (segurança)
```

### 2. Login

```
[Cliente]
    ↓
POST /auth/login
├─ Validação de dados
├─ Buscar usuário por email
├─ Comparar senhas (bcrypt.compare)
├─ Gerar JWT (15m exp)
├─ Gerar Refresh Token (7 dias)
├─ Armazenar refresh em BD
├─ Retornar JWT em cookie
└─ Retornar Refresh Token em cookie (httpOnly)

Response:
{
  "user": { "id", "email", "role" }
}

Set-Cookie: refreshToken=xyz...; httpOnly; secure; sameSite=strict
Set-Cookie: accessToken=xyz...; httpOnly; secure; sameSite=strict
```

### 3. Requisições Autenticadas

```
[Cliente com JWT]
    ↓
GET /api/users/:id
├─ Header: Authorization: Bearer <token>
├─ Middleware: jwt.verify(token)
├─ Se válido: Próximo middleware
├─ Se expirado: 401 Unauthorized
└─ Se inválido: 403 Forbidden
```

### 4. Refresh Token

```
[Cliente com JWT expirado]
    ↓
POST /auth/refresh
├─ Ler cookie: refreshToken
├─ Buscar na BD (validar integridade)
├─ Gerar novo JWT (15m)
├─ Retornar novo JWT
└─ Opcionalmente: Gerar novo Refresh Token
```

### 5. Logout

```
[Cliente autenticado]
    ↓
POST /auth/logout
├─ Invalidar refresh token (deletar da BD)
├─ Limpar cookie
└─ Retornar 200 OK

Frontend:
├─ Limpar localStorage/sessionStorage
├─ Remover axios interceptor
└─ Redirecionar para /login
```

## Estrutura de Dados

### Modelo Entidade-Relacionamento

```sql
User (1:N) Appointment
  id (PK)
  email (UNIQUE)
  name
  role (ENUM: admin, user)
  createdAt

Barber (1:N) Appointment
  id (PK)
  name (UNIQUE)
  age
  hiredAt

Specialty (N:M) Barber
  name (PK)
  description

BarberSpecialty (Junction)
  id (PK)
  barberId (FK)
  specialtyName (FK)

Appointment
  id (PK)
  clientId (FK → User)
  barberId (FK → Barber)
  specialtyName (FK → Specialty)
  startTime (DateTime)
  endTime (DateTime)
  status (scheduled, completed, canceled)

RefreshTokenSession
  token (PK)
  userId (FK)
  expiresAt (DateTime)
```

### Exemplo de Query: Buscar Disponibilidade

```sql
-- Barbeiros com especialidade X que não têm agendamento no horário Y
SELECT b.* FROM "Barber" b
JOIN "BarberSpecialty" bs ON b.id = bs."barberId"
WHERE bs."specialtyName" = 'Corte Tesoura'
  AND b.id NOT IN (
    SELECT DISTINCT a."barberId"
    FROM "Appointment" a
    WHERE a."startTime" = '2026-03-28 14:00:00'
      AND a.status = 'scheduled'
  );
```

## Regras de Negócio

### Validações de Domínio

#### 1. **Agendamentos**

```typescript
class AppointmentService {
  async createAppointment(data: CreateAppointmentDTO) {
    // Regra 1: Horários operacionais (8h-18h, 30min)
    this.validateBusinessHours(startTime);

    // Regra 2: Barbeiro não pode ter 2 agendamentos simultâneos
    const conflicts = await this.repository.findConflicts(
      barberId,
      startTime,
      endTime,
    );
    if (conflicts.length > 0) {
      throw new ConflictError("Barber already booked");
    }

    // Regra 3: Especialidade e barbeiro devem corresponder
    const hasSpecialty = await this.verifyBarberSpecialty(
      barberId,
      specialtyName,
    );
    if (!hasSpecialty) {
      throw new ValidationError("Barber does not have this specialty");
    }

    // Regra 4: Data deve ser no futuro
    if (startTime < new Date()) {
      throw new ValidationError("Cannot book in the past");
    }

    return this.repository.create(data);
  }

  async cancelAppointment(appointmentId: number) {
    const appointment = await this.repository.findById(appointmentId);

    // Regra 5: Cancelamento até 2 horas antes
    const hoursUntilAppointment =
      (appointment.startTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      throw new ValidationError("Cannot cancel within 2 hours of appointment");
    }

    return this.repository.update(appointmentId, {
      status: "canceled",
    });
  }
}
```

#### 2. **Usuários**

```typescript
class UserService {
  async register(userData: RegisterDTO) {
    // Regra: Email único
    const exists = await this.repository.findByEmail(userData.email);
    if (exists) {
      throw new ConflictError("Email already in use");
    }

    // Regra: Validação de força de senha
    this.validatePasswordStrength(userData.password);

    // Criar com role=USER sempre
    return this.repository.create({
      ...userData,
      role: "USER",
    });
  }

  async updateUser(userId: number, data: UpdateUserDTO) {
    // Regra: User não pode elevar seu próprio role
    // (apenas admin pode fazer isso)
    if (data.role && data.role !== (await this.getCurrentRole(userId))) {
      throw new ForbiddenError("Cannot change own role");
    }

    return this.repository.update(userId, data);
  }
}
```

#### 3. **Acesso e Autorização**

```typescript
class AppointmentService {
  // Regra: User vê apenas seus agendamentos
  async getUserAppointments(userId: number) {
    return this.repository.findByUserId(userId);
  }

  // Regra: Admin vê agendamentos do dia e futuros
  async getAdminAppointments(includeHistory: boolean = false) {
    const query = {
      startTime: {
        gte: includeHistory ? new Date(0) : startOfToday(),
      },
    };
    return this.repository.find(query);
  }
}
```

## Documentação de API

### Base URL

```
http://localhost:8080/api
```

### Headers Padrão

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Endpoints Principais

#### **Autenticação**

| Método | Endpoint         | Auth | Descrição              |
| ------ | ---------------- | ---- | ---------------------- |
| POST   | `/auth/register` | ✗    | Registrar novo usuário |
| POST   | `/auth/login`    | ✗    | Fazer login            |
| POST   | `/auth/refresh`  | ✗    | Renovar JWT            |
| POST   | `/auth/logout`   | ✓    | Fazer logout           |

#### **Usuários**

| Método | Endpoint     | Auth | Role  |
| ------ | ------------ | ---- | ----- |
| GET    | `/users`     | ✓    | ADMIN |
| GET    | `/users/:id` | ✓    | USER  |
| POST   | `/users`     | ✓    | ADMIN |
| PUT    | `/users/:id` | ✓    | ADMIN |
| DELETE | `/users/:id` | ✓    | ADMIN |

#### **Barbeiros**

| Método | Endpoint                   | Auth | Role  |
| ------ | -------------------------- | ---- | ----- |
| GET    | `/barbers`                 | ✓    | USER  |
| GET    | `/barbers/:id`             | ✓    | USER  |
| POST   | `/barbers`                 | ✓    | ADMIN |
| PUT    | `/barbers/:id`             | ✓    | ADMIN |
| DELETE | `/barbers/:id`             | ✓    | ADMIN |
| POST   | `/barbers/:id/specialties` | ✓    | ADMIN |

#### **Especialidades**

| Método | Endpoint             | Auth | Role  |
| ------ | -------------------- | ---- | ----- |
| GET    | `/specialties`       | ✓    | USER  |
| POST   | `/specialties`       | ✓    | ADMIN |
| DELETE | `/specialties/:name` | ✓    | ADMIN |

#### **Agendamentos**

| Método | Endpoint                                      | Auth | Role |
| ------ | --------------------------------------------- | ---- | ---- |
| GET    | `/appointments`                               | ✓    | USER |
| GET    | `/appointments/:id`                           | ✓    | USER |
| POST   | `/appointments`                               | ✓    | USER |
| PUT    | `/appointments/:id`                           | ✓    | USER |
| DELETE | `/appointments/:id`                           | ✓    | USER |
| GET    | `/appointments/barber/:barberId/availability` | ✓    | USER |

### Exemplos de Requisições

Veja o arquivo `API_DOCUMENTATION.md` para exemplos detalhados de requisições e respostas.

## Testes

### Testes Unitários (Backend)

```bash
cd api

# Executar testes
npm run test

# Modo watch
npm run test

# Com coverage
npm run test:coverage
```

### Estrutura de Testes

```
src/
├── auth/
│   └── auth.service.test.ts
├── user/
│   └── user.service.test.ts
├── barber/
│   └── barber.service.test.ts
├── specialty/
│   └── specialty.service.test.ts
└── appointment/
    └── appointment.service.test.ts
```

### Exemplo de Teste

```typescript
describe("AuthService", () => {
  it("should register user with unique email", async () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123!",
    };

    const result = await authService.register(user);

    expect(result.email).toBe(user.email);
    expect(result.message).toBe("User registered successfully");
  });

  it("should throw error if email exists", async () => {
    await authService.register(user1);

    expect(() => authService.register(user1)).rejects.toThrow(
      "User with this email already exists",
    );
  });
});
```

## Docker

### Docker Compose

```yaml
# docker-compose.yaml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: clickbeard_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  api:
    build: ./api
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/clickbeard_db
      JWT_SECRET: your-secret-key
      JWT_EXPIRY: 15m
      CORS_ORIGIN: http://localhost:3000

  ui:
    build: ./ui/click-beard-t-braga
    ports:
      - "3000:3000"
    depends_on:
      - api
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api
```

### Executar com Docker Compose

```bash
# Build e start
docker-compose up --build

# Apenas start (sem rebuild)
docker-compose up

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f api
docker-compose logs -f ui
```

### Build Manual de Imagens

```bash
# Backend
cd api
docker build -t clickbeard-api:latest .
docker run -p 3001:3001 clickbeard-api:latest

# Frontend
cd ui/click-beard-t-braga
docker build -t clickbeard-ui:latest .
docker run -p 3000:3000 clickbeard-ui:latest

```
## Fluxo de Desenvolvimento

### 1. Criar um Agendamento


```
[Cliente]
↓
Frontend: Preenche formulário
├─ Seleciona especialidade
├─ Seleciona barbeiro
└─ Seleciona horário
↓
Validação Frontend (Zod)
↓
POST /appointments
├─ Backend: Validação rigorosa
├─ Verificar conflitos de horário
├─ Verificar especialidade do barbeiro
└─ Salvar no BD
↓
Frontend: Atualizar lista de agendamentos
```

### 2. Visualizar Disponibilidade

```
[Frontend]
↓
GET /barbers/:id/availability
├─ Parâmetro: data, especialidade
├─ Backend: Buscar agendamentos do dia
├─ Calcular horários livres (08:00-18:00, slots de 30min)
└─ Retornar slots disponíveis
↓
Frontend: Renderizar horários dinamicamente
```

### 3. Cancelar Agendamento

```
[Cliente com agendamento]
↓
Validação: Tempo mínimo (2h antes)
↓
DELETE /appointments/:id
├─ Backend: Verificar propriedade
├─ Verificar janela de tempo
└─ Marcar como canceled
↓
Frontend: Confirmar cancelamento
```

## Tratamento de Erros

### Status HTTP Utilizados

| Code | Situação     | Exemplo                                |
| ---- | ------------ | -------------------------------------- |
| 200  | Sucesso      | GET bem-sucedido                       |
| 201  | Criado       | POST bem-sucedido                      |
| 400  | Bad Request  | Validação falhou                       |
| 401  | Unauthorized | JWT inválido/expirado                  |
| 403  | Forbidden    | RBAC falhou                            |
| 404  | Not Found    | Recurso inexistente                    |
| 409  | Conflict     | Email duplicado, barbeiro indisponível |
| 500  | Server Error | Erro não tratado                       |

### Formato de Erro

```json
{
  "error": "Email already in use",
  "code": "CONFLICT_EMAIL",
  "status": 409
}
````

## Autor

**Thomas Braga**  
GitHub: [@thomasbscj](https://github.com/thomasbscj)  
Email: thomaslimabraga@gmail.com


## Recursos Adicionais

- [Express.js Documentation](https://expressjs.com)
- [Prisma ORM](https://www.prisma.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [OWASP Security](https://owasp.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Atualizado em:** 28 de março de 2026  
**Versão:** 1.0.0
