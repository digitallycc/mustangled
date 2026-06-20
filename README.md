# Mustang LED Presales Flow

Mobile-first LED screen qualification flow deployed as a static Next.js site on Cloudflare Pages. Cloudflare Pages Functions validate WhatsApp numbers and send server-calculated recommendations through Evolution API.

## Runtime Flow

1. `POST /api/validate-number` normalizes the submitted international number and checks it through Evolution API.
2. The browser collects use case, environment, and approximate size.
3. `POST /api/send-recommendation` revalidates the number, calculates the recommendation, sends the result text, and then sends `/mustangled.pdf` as a separate whitepaper document.
4. The UI reports success once the result text succeeds. A later PDF failure is logged but does not change the user-facing result.

The browser cannot provide arbitrary WhatsApp message content. Recommendation copy and document metadata are generated inside the Pages Function.

## Cloudflare Configuration

Build command:

```text
npm run build
```

Build output directory:

```text
out
```

Add these encrypted secrets to both Production and Preview when preview deployments need working API routes:

```text
EVOLUTION_BASE_URL
EVOLUTION_API_KEY
EVOLUTION_INSTANCE
```

No Cloudflare resource bindings are currently required.

Configure Cloudflare rate limiting for both public routes. Use a stricter limit for `/api/send-recommendation` than `/api/validate-number`, and scope rules to `POST` requests. Exact thresholds should follow the traffic profile and Cloudflare plan.

## Local Development

Copy `.dev.vars.example` to `.dev.vars` and add the local Evolution credentials. `.dev.vars` is ignored by Git.

Run the frontend only:

```bash
npm run dev
```

Run a production-style Pages preview with Functions:

```bash
npm run preview:cf
```

## Verification

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```
