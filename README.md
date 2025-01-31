# Kwila Demo

A basic demo app for kwila.cloud.

The frontend is hosted at [demo.kwila.cloud](https://demo.kwila.cloud).

The backend is hosted at [api.demo.kwila.cloud](https://api.demo.kwila.cloud).

## Running Locally

### Backend

1. Create a `.env.local` file with
   ```
   CLERK_SECRET_KEY=<SECRET_KEY_HERE>
   ```
2. Run `docker build . -t kwila-demo-api`
3. Run `docker run -p 80:80 --env-file .env.local kwila-demo-api:latest`

The API should now be available on port 80 of `localhost`!

### Frontend

1. Create a `.env.local` file with
   ```
   VITE_CLERK_PUBLISHABLE_KEY=<PUBLISHABLE_KEY_HERE>
   VITE_API_URL=http://localhost:80
   ```
2. Run `npm i`
3. Run `npm run dev`

The frontend should now be available on port 5173 of `localhost`!
