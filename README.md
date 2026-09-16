# Carbon Tracker

Community carbon footprint and green rewards tracker with a React frontend, Express API, and PostgreSQL database.

## Run locally

1. Create `backend/.env` from `backend/.env.example` and set your PostgreSQL credentials.
2. Install and start the API:

   ```bash
   cd backend
   npm install
   npm run seed
   npm start
   ```

3. Install and start the frontend in a second terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and the API health check is at `http://localhost:5000/api/health`.

## Free deployment with GitHub, Render, and Neon

This project can be hosted at no cost using Render's free web/static services and Neon PostgreSQL's free tier. Free Render web services sleep when idle, so the first request after a period of inactivity may take a few seconds.

1. Create a free PostgreSQL project at [Neon](https://neon.tech), copy its pooled connection string, and keep it ready as `DATABASE_URL`.
2. Push this repository to GitHub.
3. In Render, choose **New +** -> **Blueprint**, select the GitHub repository, and apply `render.yaml`.
4. Open the `carbon-tracker-api` service environment settings and set `DATABASE_URL` to the Neon connection string.
5. Confirm the frontend service environment variable `VITE_API_BASE_URL` points to the deployed API URL followed by `/api`. The default is `https://carbon-tracker-api.onrender.com/api`; use the actual URL if Render assigns a different one.

After the API deploys, open its Render shell and seed the database once:

```bash
npm run seed
```

Before seeding, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` as API service environment variables. Render generates `JWT_SECRET` automatically from the Blueprint.

The Blueprint expects the API service to keep the name `carbon-tracker-api`, so its public URL matches the frontend `VITE_API_BASE_URL` value. If you rename the API service, update that frontend environment variable in Render.