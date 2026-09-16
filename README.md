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

## Deploy with GitHub and Render

Push this repository to GitHub, then create a new Render Blueprint and select the repository. Render will use `render.yaml` to create a PostgreSQL database, deploy the API, and build the frontend as a static site.

After the first deploy, run the database seed once from the API service shell:

```bash
npm run seed
```

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` as API service environment variables before seeding. Render automatically provides the database connection variables and generates `JWT_SECRET` from the Blueprint.

The Blueprint expects the API service to keep the name `carbon-tracker-api`, so its public URL matches the frontend `VITE_API_BASE_URL` value. If you rename the API service, update that frontend environment variable in Render.