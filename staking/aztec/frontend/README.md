# Aztec Liquid Staking Frontend

A modern, dark-themed DeFi frontend for the stAZTEC liquid staking protocol.

## Features

- **Stake/Unstake Widget**: Convert between AZTEC and stAZTEC
- **Portfolio View**: Track your staking position and rewards
- **Withdrawal Queue**: Monitor pending withdrawals with countdown
- **Stats Bar**: Live TVL, APY, and exchange rate display
- **Mock Mode**: Fully functional with mock data (no chain connection required)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (mock mode)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Development Modes

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with mock data |
| `npm run dev:mock` | Explicit mock mode (NEXT_PUBLIC_MOCK=true) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript compilation check |
| `npm test` | Run Jest tests |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with ToastProvider
│   ├── page.tsx        # Main staking page
│   └── globals.css     # Tailwind + custom styles
├── components/
│   ├── ui/             # Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Tabs.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── StakeWidget.tsx     # Main staking interface
│   ├── WithdrawalQueue.tsx # Pending withdrawals list
│   ├── PortfolioView.tsx   # User's staking position
│   ├── StatsBar.tsx        # Protocol statistics
│   ├── ConnectWallet.tsx   # Wallet connection UI
│   └── ToastProvider.tsx   # Toast notifications
├── hooks/
│   ├── useWallet.ts    # Wallet connection (mock)
│   ├── useStaking.ts   # Staking operations (mock)
│   └── useTransaction.ts # Transaction tracking
├── lib/
│   ├── cn.ts           # Class name utility
│   └── format.ts       # Number/address formatting
├── mocks/
│   └── data.ts         # Mock data for development
└── __tests__/          # Jest test files
```

## Configuration

### Tailwind Colors

Custom colors are defined in `tailwind.config.ts`:

| Color | Value | Use |
|-------|-------|-----|
| `aztec-purple` | #7B3FE4 | Primary brand color |
| `aztec-dark` | #0D0D1A | Background |
| `aztec-card` | #1A1A2E | Card backgrounds |
| `aztec-border` | #2D2D44 | Borders |

### Environment Variables

None required for mock mode. For production:

```env
NEXT_PUBLIC_AZTEC_RPC_URL=https://...
NEXT_PUBLIC_LIQUID_STAKING_CORE_ADDRESS=0x...
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

Test coverage includes:
- Format utilities (100%)
- StakeWidget component
- WithdrawalQueue component
- useWallet hook
- useStaking hook

## Design System

### Typography
- Primary font: Inter (system fallback)
- Headings: Bold, white
- Body: Regular, gray-400

### Spacing
- Cards: rounded-2xl (1rem radius)
- Buttons: rounded-lg (0.5rem) to rounded-xl (0.75rem)
- Page padding: 4rem top/bottom, 1rem horizontal

### Animations
- Button hover: opacity transition
- Toast notifications: slide-in from right
- Loading states: pulse animation
- Pending badge: slow pulse

## Integration with Aztec

The frontend is designed to work with mock data by default. To integrate with the actual Aztec network:

1. Install Aztec SDK (when available)
2. Update hooks to use real contract calls
3. Replace mock data with live queries
4. Configure wallet connection

Key contract interfaces expected:
- `LiquidStakingCore.deposit(amount, exchange_rate, nonce)`
- `LiquidStakingCore.request_withdrawal(st_aztec_amount, exchange_rate, timestamp)`
- `WithdrawalQueue.claim_withdrawal(request_id, timestamp)`

## License

MIT
