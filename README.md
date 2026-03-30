This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Node.js

- **Next.js app** runs on Node 18+.
- **Storybook 10** requires **Node 20.19+** or **22.12+** (`pnpm storybook`, `pnpm build-storybook`).
- This repo includes **`.nvmrc`** (`20.19.0`). With [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`.
- **Full pipeline** (app build + Jest + Storybook static build): `pnpm verify` — use Node **20.19+** or the Storybook step will exit with the version error.
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

`supabase db reset` reapplies migrations and runs `supabase/seed.sql`. That inserts **3 approved artists** and **30 approved art pieces** (fixed UUIDs). Image paths in the database stay **NULL** until you run the local asset script below.

**Typical local order**

1. Run **`supabase start`** if the stack is not up, then **`supabase db reset`**.
2. Drop images into **`scripts/seed-assets/<artistId>/<artPieceId>/`** if not already present — naming and layout are documented in [`scripts/seed-assets/README.md`](scripts/seed-assets/README.md). Missing folders or missing `display-0.*` files are skipped with a warning.
3. Set **`NEXT_PUBLIC_SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** (Secret from **`supabase status`**) in `.env.development.local`. Run **`pnpm seed:local-assets`** to upload images and patch `art_piece` / `art_piece_display_image`.

**Optional — owned test artist:** There will be no users after a database reset. To recreate a user, run **`pnpm local:create-auth-user`** then **`supabase/seed_link_test_artist.sql`** in the local SQL Editor. This way, you will have a user that is linked to the first test artist, enabling you to test artist features. 

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

## Files
The above scripts only back up the tables and the database records. *They do not back up any of the image files in our Supabase Storage Buckets.* To do this, we need to run a custom script that downloads all the image files into a cloud server. This script is found in `backup-images.ts`.


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


# Unit Tests
To run tests, run `pnpm test`. Jest will search the app for any .test.tsx files and execute them. 

Unit tests cover accessibility, interaction, and behaviour. They use a mock Supabase server that returns data of the same shape as the actual API. In the future, integration tests will be added to confirm that the data gets returned by the actual Supabase API.

## Snapshots
Snapshots of the UI are kept in the `__tests__/__snapshots__` folder. These will fail if the UI has changed since the last snapshot. If any snapshot tests are failing because of UI changes, run `jest --updateSnapshot` to update the snapshot, and then rerun the tests. For more information on snapshots, visit https://jestjs.io/docs/snapshot-testing.

# Storybook
Storybook is integrated in this repo to document components and test for visual and accessibility inconsistencies. Each component has it's own .stories file that lives in the same folder as the component.

- **Dev:** `pnpm storybook` (requires Node **20.19+**)
- **Static build:** `pnpm build-storybook` → output in `storybook-static/`
- **All checks:** `pnpm verify` (Next build + Jest + Storybook build) *Note: for the Storybook build to work, this command needs to be prefaced with `nvm use 20.19`*



