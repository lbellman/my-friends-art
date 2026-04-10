This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Node.js

- **Next.js app** runs on Node 18+.
- **Storybook 10** requires **Node 20.19+** or **22.12+** (`pnpm storybook`, `pnpm build-storybook`).
- This repo includes **`.nvmrc`** (`20.19.0`). With [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`.
- **Full pipeline** (app build + Playwright + Jest + Storybook static build): `pnpm verify` — use Node **20.19+** or the Storybook step will exit with the version error.
- **Vercel:** set **Node.js Version** to **20.x** (pick **20.19** or newer if available) for any project that runs `build-storybook`.

# Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Supabase CLI
Supabase CLI provides tools for working with local databases, and accessing and managing remote databases.

## Local Database (for development purposes and migration testing)
To work with a local database, run `supabase start`. This creates a local database and applies any existing migrations in your project.

### Seeding Local Database
To create a brand new local database with seeded data, run:
```bash
pnpm run local-db:reset
```

This clears all data, tables, and storage files in your local database. It then recreates the database and applies all migrations. Once that is successful, it seeds the storage buckets with assets. See below if this is your first time creating a local database.

**Running Local DB for the first time**
1. Drop images into **`scripts/seed-assets/<artistId>/<artPieceId>/`** if not already present — naming and layout are documented in [`scripts/seed-assets/README.md`](scripts/seed-assets/README.md). Missing folders or missing `display-0.*` files are skipped with a warning.
2. Set **`NEXT_PUBLIC_SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** (Secret from **`supabase status`**) in `.env.development.local`
2. Run **`supabase start`** if the stack is not up, then **`pnpm run local-db:reset`**. 

## Remote Database
To connect to a remote database, run `pnpm run db:link:dev` or `pnpm run db:link:prod`. 
*Linking to prod is for DEPLOYING ONLY. Only connect to prod if you have already tested your migrations on dev or local!* 

After you are connected to a remote database, you can run any of the `supabase db` commands.

`supabase db pull` : Creates migration files from the data and tables in the remote database. It will compare the created migrations against the Supabase Migration history from the project dashboard. It will not recreate a migration file if it already exists in the history.

`supabase db push`: Pushes all local migrations to a remote database. This requires your project to be **linked** to a remote database. Ensure you run `pnpm run db:link:<env>` to link your project to the correct database. *Recommended: Run the command first with the --dry-run flag to verify that the right migrations are being applied. --dry-run will print the migrations that will be applied, without actually applying them.*

`supabase db reset` : Resets your local database. 
*Make sure you never use the --linked or --db-url flag, otherwise it will affect whatever remote database you are currently linked to.*

`supabase db dump --file <filename>` : For backups. Dumps your DB data into the specified file. The default command only dumps `CREATE TABLE` statements and the like. It does not backup any data. I recommend running this twice, once with the --data-only flag (creates `INSERT INTO` statements with all of your current db data), and once without.

# Backups
This project is on the Supabase Free Plan, so automatic database backups are not supported. This means we have to manually backup all the data for safety. Luckily this is not so difficult. Supabase provides commands to download all the SQL statements needed to recreate our entire database. I have saved these commands in neat little package scripts found in `package.json`.

```bash
#  -------- DEVELOPMENT ----------
# Backs up tables into backup-tables-dev.sql
pnpm run db:backup:dev:tables 

# Backs up data into backup-data-dev.sql
pnpm run db:backup:dev:data

# --------- PRODUCTION -----------
# Backs up tables into backup-tables-prod.sql
pnpm run db:backup:prod:tables

# Backs up data into backup-data-prod.sql
pnpm run db:backup:prod:data
```

## Storage Bucket Backups
The above scripts only back up the tables and the database records. *They do not back up any of the image files in our Supabase Storage Buckets.* To do this, we need to run a custom script that downloads all the image files into a cloud server. This script is found in `backup-images.ts`. *NOTE: This is not implemented yet. Currently there are no backups for images in Supabase Storage Buckets.*


# Component Library
Components are organized in the atomic structure (atoms, molecules, and organisms). An extra component folder was created for layout components (`InternalLayout`, `Footer`, `Navbar` etc). Each component has its own folder containing unit test files and storybook files. See below for an example of this file structure:

```
├── components/
|   |-- atoms/
|   |     |-- button/
|   |     |     |-- Button.tsx
|   |     |     |-- Button.stories.tsx
|   |     |     |-- Button.test.tsx
        [...]
```


# Testing
## Unit Tests
Unit tests are hosted by Jest. Their purpose is to cover simple components in interaction, accessibility, and behavior. They use a mock Supabase server which returns fake data in the shape of the production database. Execute the following command to run the unit tests:
```bash
pnpm run unit-tests
```


### Snapshots
Snapshots of the UI are kept in the `__tests__/__snapshots__` folder. These will fail if the UI has changed since the last snapshot. If any snapshot tests are failing because of UI changes, run the following command:
```bash 
pnpm run test:update-snapshot
```
For more information on snapshots, visit https://jestjs.io/docs/snapshot-testing.

## Integration Tests
Integration tests are hosted by Playwright. Their purpose is to cover end to end UI and database behavior. An integration test will log in as a particular user (artist or admin), query actual data from the database, and perform database operations with assertions on the results. To run the integration tests, execute the following command:
```bash
pnpm run integration-tests
```

The integration tests are split into three folders: 
1. **Admin**: These are for testing admin behavior such as ability to approve and view art piece submissions, ability to delete and manage product requests, etc. The `auth.admin.setup.ts` file uses `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` variables in `.env.test.local` to log in as the admin. *NOTE: This is an actual admin user in the local database. The user is created by seed.sql when the local database is launched.*
2. **Artist**: These tests are for artist functions. Artists can login, edit their profile, submit art pieces, but they cannot see other artist's profiles or approve their own art pieces. Certain restricted admin behavior should be tested in this folder to ensure that artists don't have admin permissions. The `auth.artist.setup.ts` file uses `E2E_ARTIST_EMAIL` and `E2E_ARTIST_PASSWORD` from the `.env.test.local` file to log in as an artist. 
3. **Public**: These are tests for unauthenticated users visiting the page. The public should be able to see art pieces, artists, and submit product requests. There is no setup file for these tests, because they do not require any authentication.

**Emails:** Integration tests that trigger transactional emails (e.g. product requests) should not send real mail. When Playwright starts the dev server via `playwright.config.ts`, it sets `DISABLE_TRANSACTIONAL_EMAIL=1` in that process so Resend is skipped. If you run `pnpm dev` yourself and use **reuse existing server** (default locally), add `DISABLE_TRANSACTIONAL_EMAIL=1` to `.env.development.local` while running those tests, or you will send real emails.

**Database assertions:** Some tests query Supabase after a UI action (e.g. checking `product_request` rows). Playwright loads `.env.test.local` and `.env.development.local`; set `NEXT_PUBLIC_SUPABASE_URL` to your local API URL and `SUPABASE_SERVICE_ROLE_KEY` to the **service role** secret from `supabase status` (same as `pnpm seed:local-assets`). The service role bypasses RLS and must only be used in Node test helpers such as `tests/helpers/supabase-admin.ts`, never in browser code.

Below is the folder structure for the three types of tests:
```
├── tests/
|   |-- admin/
|   |     |-- art-piece-submissions.spec.ts 
              [...]
|   |-- artist/
|   |     |-- profile.spec.ts 
              [...]
|   |-- public/
|   |     |-- home.spec.ts 
              [...]
```


# Storybook
Storybook is integrated in this repo to document components and test for visual and accessibility inconsistencies. Each component has it's own .stories file that lives in the same folder as the component.
```bash
pnpm storybook
```
```bash
pnpm build-storybook
```
Output in `storybook-static/`

# Verification
This is the ultimate build. Runs Next Build, Integration Tests, Unit Tests, and Storybook Build. Run this command before every major push. Run it when you get out of bed in the morning. This script will find everything.
```bash
pnpm verify
```

