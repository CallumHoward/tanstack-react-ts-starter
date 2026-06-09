# iOS (Capacitor)

This app is a TanStack Start web app wrapped as a native iOS app with
[Capacitor](https://capacitorjs.com/). Capacitor loads a **static client build**
in a native `WKWebView`, so the app is built in **SPA mode** (no SSR server at
runtime).

## How it fits together

- `vite.config.ts` enables SPA mode **only for the mobile build** (gated behind
  the `MOBILE_BUILD=true` env var that `build:mobile` sets). The default
  `pnpm build` keeps SSR; the mobile build prerenders a client-only shell
  (`.output/public/_shell.html`) that boots the router on the client for every
  route.
- `scripts/prepare-mobile.sh` copies `.output/public` into `www/` and promotes
  the shell to `www/index.html` (Capacitor's required entry point).
- `capacitor.config.ts` points `webDir` at `www/`.
- `www/` and the iOS build artifacts are git-ignored; the `ios/` native project
  is committed (after you generate it — see below).

## Scripts

| Script              | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `pnpm build:mobile` | Build the web app and stage `www/` for Capacitor.        |
| `pnpm ios:add`      | Build + scaffold the native `ios/` project (first time). |
| `pnpm ios:sync`     | Build + copy web assets and native deps into `ios/`.     |
| `pnpm ios:open`     | Open the project in Xcode.                               |

## First-time setup (requires macOS)

Building and running iOS requires **macOS with Xcode and CocoaPods** — it cannot
be done on Linux/CI-without-macOS. On your Mac:

```bash
pnpm install
sudo gem install cocoapods   # if not already installed
pnpm ios:add                 # generates the ios/ project
pnpm ios:open                # open in Xcode, pick a simulator, press Run
```

Commit the generated `ios/` folder so the native project is tracked.

## Day-to-day

After changing web code:

```bash
pnpm ios:sync   # rebuild web + sync into ios/
pnpm ios:open   # run from Xcode
```

## Talking to a backend

The bundled app has **no SSR server**. Any server-side data must come from a
**deployed HTTPS API**. Because the WebView origin is `capacitor://localhost`,
configure your API's CORS to allow it. Avoid TanStack `createServerFn` / server
routes for data the mobile app needs — use client-side fetches against the
remote API instead.

### Live reload against the dev server (optional)

For fast iteration you can point the native app at the running Vite dev server
instead of the bundled assets. Temporarily add to `capacitor.config.ts`:

```ts
server: { url: "http://<your-LAN-ip>:3000", cleartext: true }
```

Run `pnpm dev`, `pnpm ios:sync`, then launch from Xcode. Remove this before
producing a release build.
