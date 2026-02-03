# Merchant Center Feed (Hardware Wallets)

Last updated: 2026-02-03

## Scope

- **Included:** hardware wallets with verified USD pricing.
- **Excluded:** software wallets, ramps, and most cards (free or fee-based; not suitable for Merchant Center pricing).
- **Currency:** USD only.

## Pricing sources (USD)

| Item | Price (USD) | Source |
| --- | --- | --- |
| Ledger Nano X | 99 | https://shop.ledger.com/products/ledger-nano-x |
| Ledger Nano S+ | 59 | https://shop.ledger.com/products/ledger-nano-s-plus |
| Ledger Nano Gen5 | 179 | https://shop.ledger.com/products/ledger-nano-gen5 |
| Ledger Flex | 249 | https://shop.ledger.com/products/ledger-flex |
| Trezor Safe 3 | 59 | https://trezor.io/trezor-safe-3 |
| OneKey Pro | 278 | https://onekey.so/products/onekey-pro-hardware-wallet/ |
| OneKey Classic 1S | 99 | https://onekey.so/products/onekey-classic-1s-hardware-wallet/ |
| OneKey Classic 1S Pure | 79 | https://onekey.so/products/onekey-classic-1s-hardware-wallet/#pure |
| Blockstream Jade | 79 | https://store.blockstream.com/product/blockstream-jade/ |

## Excluded from feed (no verified USD price or out of scope)

- Arculus (blocked by 403 during automated fetch)
- BitBox02 (EUR pricing; feed limited to USD)
- BitBox02 Nova (EUR pricing; feed limited to USD)
- ColdCard Mk4 (blocked by 403 during automated fetch)
- Ellipal Titan 2.0 (no product page found)
- Foundation Passport (no price on marketing page)
- GridPlus Lattice1 (store hostname not resolvable)
- Keystone 3 Pro (no price in page HTML)
- Keycard (EUR pricing; feed limited to USD)
- Keycard Shell (EUR pricing; feed limited to USD)
- Krux (DIY, no fixed retail price)
- Ledger Stax (bundle pricing only; base device price not verified)
- NGRAVE ZERO (no structured price in HTML)
- SafePal S1 (no structured price found)
- SecuX V20 (no structured price found)
- SeedSigner (DIY, no fixed retail price)
- Specter DIY (DIY, no fixed retail price)
- Tangem Wallet (no structured price found)
- Trezor Safe 5 (excluded per feed scope)
- Trezor Safe 7 (excluded per feed scope)

## Maintenance notes

- Update `wallets/data/merchant_pricing.json` when vendor pricing changes.
- Regenerate the feed with:
  - `python3 wallets/scripts/generate_merchant_feed.py`
- Public feed output: `wallets/frontend/public/merchant-center.xml`.
- CI refresh workflow: `.github/workflows/generate-merchant-feed.yml`.

## FAQ

**Why are software wallets excluded?**  
They are free to download and not appropriate for Merchant Center product pricing.

**Why are ramps excluded?**  
Ramps are fee-based services (not a fixed-price product).

**Why are some hardware wallets excluded?**  
We only include items with verifiable USD pricing and a direct product page.

**How do I add a new priced item?**  
Add a USD price, source URL, and `last_checked` date in `wallets/data/merchant_pricing.json`, then rerun the feed generator.

## Playwright verification (crypto card checks)

On Ubuntu 25.10, Playwright required the Ubuntu 24.04 `libicu74` package:

```
sudo wget -O /tmp/libicu74_74.2-1ubuntu3_amd64.deb \
  http://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu74_74.2-1ubuntu3_amd64.deb
sudo dpkg -i /tmp/libicu74_74.2-1ubuntu3_amd64.deb
npx playwright install-deps
```

Then run:

```
node wallets/scripts/verify-crypto-cards.js > wallets/artifacts/crypto_cards_validation.txt
```

Artifacts are gitignored; keep validation output locally.
