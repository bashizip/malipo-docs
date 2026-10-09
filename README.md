# Malipo documentation

English pages use unprefixed URLs; French pages live under `/fr/`. Integration guides are in `src/content/docs/`.

## Validation and deployment

Make changes on `dev` or a branch targeting `dev`, then validate them on https://docs-staging.malipo.dev. Vercel tracks `dev` for this Preview domain. Preview builds use the staging domain for canonical links and sitemaps.

Production remains on `main` at https://docs.malipo.dev. Promote reviewed documentation through a `dev → main` pull request after staging acceptance; do not push new documentation directly to `main`. A staging deployment does not publish changes to the production domain.

GitHub Actions installs dependencies from the lockfile and builds documentation on pushes and pull requests. Vercel manages deployments separately. Keep the build check passing before promotion.

```sh
npm ci
VERCEL_ENV=preview npm run build
npm run preview
```

Use `VERCEL_ENV=production npm run build` to verify production canonical URLs locally. Neither build command deploys the site.
