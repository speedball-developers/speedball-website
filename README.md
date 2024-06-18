<!--<a href="https://kit.svelte.dev/docs/introduction"><img alt="Sveltekit" src="https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00"/></a>
<a href="https://flowbite-svelte.com/docs/components/accordion"><img alt="Flowbite Tailwind" src="https://img.shields.io/badge/flowbite%20tailwindcss-0F172A?&logo=tailwindcss&style=for-the-badge"/></a>-->

[![Sveltekit](https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)](https://kit.svelte.dev/docs/introduction)[![Flowbite Tailwind](https://img.shields.io/badge/flowbite%20tailwindcss-0F172A?&logo=tailwindcss&style=for-the-badge)](https://flowbite-svelte.com/docs/components/accordion)[![i18n](https://img.shields.io/badge/-i18n-26A69A?style=for-the-badge)](https://inlang.com/m/dxnzrydw/paraglide-sveltekit-i18n/getting-started)[![Drizzle-ORM](https://img.shields.io/badge/-Drizzle%20ORM-050505?style=for-the-badge)](https://orm.drizzle.team/docs/overview)![TypeScript](https://img.shields.io/badge/typescript%20-%23007ACC.svg?&style=for-the-badge&logo=typescript&logoColor=white)![Vite](https://img.shields.io/badge/-Vite-1870c7?style=for-the-badge)

This is the GitHub repo for the [speedball community website](https://speedball-thegame.com/).

## Development - How to get started

VS Code Recommendend

#### Install the dependencies

```bash
pnpm install
```

#### Setup the project

Create a valid .env file using the .env.example as a base.
Ask one of the developers to give you the /stc/lib/server/schema.ts file.

#### Recommended VS Code Extensions:

ESLint, Prettier, Svelte for VS Code, Sherlock – inspector for i18n

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> The app uses a node.js adapter and is uploaded onto a server using plesk and pm2. To learn more about other target environments take a look at other [adapters](https://kit.svelte.dev/docs/adapters).

If the production build works, you can upload the /build/ folder, the package.json and the index.cjs files onto the server and let pm2 restart the application.
You may also want to create a new package-lock.json file and upload it to the server. To do so use the `pnpm install --save-exact` comand.

### Additional information

To add new translations, create them in the /messages/xx.json files and then run `pnpm build`. This will compile the language files and update the /lib/paraglide/messages/xx.js files from which the code imports its translations.

---

To generate new mysql schemata for drizzle use

```bash
pnpm drizzle-kit introspect # dont use this if you dont know what it does
```

Keep in mind that introspect gives you a lot of false properties in your schema.ts which you need to fix manually.

---

To use the drizzle sql viewer in your browser use

```bash
pnpm drizzle-kit studio # gives you a MySQL browser in your browser
```

---

The server json api could maybe be optimized by enabling compression. Take a look at the [documentation](https://kit.svelte.dev/docs/adapter-node#deploying-compressing-responses) for more info.
