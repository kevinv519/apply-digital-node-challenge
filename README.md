# Apply Digital Node Challenge

## Overview

The Apply Digital Node Challenge is a Node.js application built with NestJS, PostgreSQL, and TypeORM. It syncs products with the Contentful API, lists paginated results, removes products only for this application, and provides endpoints to get reports about products data.

## Specific notes about the challenge

You can see pull requests in [here](https://github.com/kevinv519/apply-digital-node-challenge/pulls?q=is%3Apr+is%3Aclosed)

### Choices

- Production applications usually rely on migrations to commit database changes. This project follows the same approach. You can find them at `src/migrations`
- Migrations will run automatically when starting the application.
- Usage of husky to add git hooks for pre-commit and pre-push actions
- Add only tests for main functionality and not for secondary stuff like authentication
- Run the sync action every time the server starts. This can be changed at `src/products/services/product.service.ts[constructor]`
- Implement only authentication by email, without roles. Anyone logged in can see the reports and delete products. Decision made to ease the implementation for the project.

## Prerequisites

- Node.js LTS
- Docker
- PostgreSQL
- GitHub Actions (for CI/CD)

## Installation

1. Clone this repository: `git clone https://github.com/kevinv519/apply-digital-node-challenge.git`
2. Install dependencies (for VSCode intellisense): `npm install`
3. Copy `.env.example` file to `.env` and replace values accordingly

## Running

1. Start project with `docker compose up -d`
2. Go to `http://localhost:3000/api/docs`

## Tests

With coverage

```bash
npm run test:cov
```

## IMPORTANT

If you like how this solution is structured, you should hire me :)
