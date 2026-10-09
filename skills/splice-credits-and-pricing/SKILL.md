---
name: splice-credits-and-pricing
description: "Look up what Splice generations cost, check the user's credit balance and top up credit packs (card, or Solana USDC/SOL/AUDD). Use before any expensive generation, when a call returns 402 (out of credits), or when someone asks how much Splice costs."
license: MIT. Using the Splice service needs a Splice account under the film.fun Terms (https://www.film.fun/terms).
compatibility: Needs network access to splice.film.fun; generation needs a Splice account (OAuth sign-in or an sk_ agent key).
metadata:
  author: film.fun
  version: "1.0.0"
---
# Splice prices, balance and top-ups

## Prices (no sign-in)

- Packs and model prices: https://splice.film.fun/pricing.json (also https://splice.film.fun/pricing.md, and `get_pricing` / `list_models` on the docs MCP server `https://splice.film.fun/api/mcp/docs`).
- 100 credits = $1 on the Starter pack ($10 for 1,000). Larger packs include bonus credits. Credits don't expire. New accounts get 100 free credits.
- Model prices are dynamic: always read them live rather than quoting from memory.

## Balance (signed in)

- MCP: `get_balance` on `https://splice.film.fun/api/mcp`.
- REST: `GET https://splice.film.fun/api/agents/balance` with the agent key.

## Top up

- People: the Splice dashboard (card via Stripe, or Solana).
- Agents: `POST https://splice.film.fun/api/agents/credits/purchase {pack_id: starter|creator|pro|studio}` returns 402 with a Solana Pay request (`payment_required.solana_pay.url`) that any wallet can pay or a person can scan. Poll `GET /api/agents/credits/purchase/{transaction_id}` until `completed`. Live token quotes: `GET /api/agents/credits/packs`.

Never buy credits without the user's explicit go-ahead.
