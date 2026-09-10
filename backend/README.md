# CryptoSence Role-Based Authentication Backend

Supports:
- user
- admin
- marketing

## Setup

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/user/dashboard`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/marketing/dashboard`
- `GET /api/marketing/strategy`

## Login Response Shape

```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "...",
    "username": "...",
    "email": "...",
    "role": "admin"
  }
}
```
