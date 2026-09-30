# Production Deployment

This repository includes a Render Blueprint in `render.yaml`. Production starts with an empty student registry and empty account store; the local JSON demo data and demo users are not copied to PostgreSQL.

## Render setup

1. Push this repository to the GitHub repository connected to Render.
2. In Render, create a new Blueprint instance from the repository and review the web service and PostgreSQL database resources.
3. Set `INITIAL_PRINCIPAL_USERNAME` and `INITIAL_PRINCIPAL_PASSWORD` in Render when prompted. Use a unique username and a generated password of at least 12 characters. Do not commit or share the password.
4. Apply the Blueprint and wait for `/api/v1/health` to report healthy.
5. Sign in as the initial Principal, download the student CSV template, validate the school roster, then import the approved records.
6. Have the Principal create/approve staff and guardian accounts after the student registry is loaded.

The first Principal is created once from the two Render environment variables and stored as a salted password hash in PostgreSQL. Later restarts load the same account and do not recreate or reset its password. Student, payment-ledger, SMS-log, account, and pending registration data are stored in PostgreSQL JSONB rows and writes are awaited before the API reports success.

## Production limitations

- M-Pesa STK push and callback remain disabled until live Safaricom Daraja credentials and a verified callback URL are configured.
- SMS sending/broadcast remains disabled until a real SMS provider is configured; production never reports simulated messages as delivered.
- Bank deposits are recorded only when school bursar staff verify them in the portal.
- Do not use the seeded development credentials in production. The production account store does not load demo users or local JSON records.

## Local production-mode check

Set `DATABASE_URL`, `INITIAL_PRINCIPAL_USERNAME`, and `INITIAL_PRINCIPAL_PASSWORD` in the environment, then run:

```sh
npm ci --include=dev
npm run build
NODE_ENV=production npm start
```

Production startup intentionally fails if PostgreSQL or the initial Principal credentials are missing.
