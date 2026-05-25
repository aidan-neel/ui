FROM oven/bun:1 AS base
WORKDIR /app

# Install deps separately so they cache across source changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Bring in the source, then pre-generate the Prisma client at build time.
# `prisma generate` doesn't connect to the DB but `prisma.config.ts` reads
# DATABASE_URL eagerly, so a placeholder is enough to satisfy that check.
COPY . .
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
	bun --bun run prisma generate

ENV PORT=4100
EXPOSE 4100

# Apply pending migrations at startup (DB may not be ready at build time),
# then boot the API.
CMD ["sh", "-c", "bun --bun run prisma migrate deploy && bun run src/index.ts"]
