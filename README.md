This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Node.js

- **Next.js app** runs on Node 18+.
- **Storybook 10** requires **Node 20.19+** or **22.12+** (`pnpm storybook`, `pnpm build-storybook`).
- This repo includes **`.nvmrc`** (`20.19.0`). With [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`.
- **Full pipeline** (app build + Jest + Storybook static build): `pnpm verify` — use Node **20.19+** or the Storybook step will exit with the version error.
- **Vercel:** set **Node.js Version** to **20.x** (pick **20.19** or newer if available) for any project that runs `build-storybook`.

## Getting Started
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

## Component Library
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


## Unit Tests
Unit tests are written in the `__tests__` folder. To run tests, run `pnpm test`. 

Unit tests cover accessibility, interaction, and behaviour. They use a mock Supabase server that returns data of the same shape as the actual API. In the future, integration tests will be added to confirm that the data gets returned by the actual Supabase API.

### Snapshots
Snapshots of the UI are kept in the `__tests__/__snapshots__` folder. These will fail if the UI has changed since the last snapshot. If any snapshot tests are failing because of UI changes, run `jest --updateSnapshot` to update the snapshot, and then rerun the tests. For more information on snapshots, visit https://jestjs.io/docs/snapshot-testing.

## Storybook
Storybook is integrated in this repo to document components and test for visual and accessibility inconsistencies. Each component has it's own .stories file that lives in the same folder as the component.

- **Dev:** `pnpm storybook` (requires Node **20.19+**)
- **Static build:** `pnpm build-storybook` → output in `storybook-static/`
- **All checks:** `pnpm verify` (Next build + Jest + Storybook build)


