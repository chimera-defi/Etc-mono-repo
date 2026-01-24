export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(111,77,255,0.25),_transparent_55%),radial-gradient(circle_at_25%_75%,_rgba(255,153,102,0.25),_transparent_50%),linear-gradient(180deg,_#0b0c10_0%,_#11131a_45%,_#0b0c10_100%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 md:px-10">
        <header className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
            Local Sandbox
            <span className="h-2 w-2 rounded-full bg-[var(--aztec-mint)] shadow-[0_0_12px_rgba(99,242,182,0.6)]" />
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
            Aztec Staking Sandbox
            <span className="block text-white/60">Local-only UI shell</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            Connect this UI to the local Aztec sandbox to test staking, withdrawals,
            and queue behavior without devnet spend.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-[var(--aztec-violet)] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(111,77,255,0.35)] transition hover:-translate-y-0.5 hover:bg-[#5a39f0]">
              Start Sandbox
            </button>
            <button className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
              Refresh Status
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[var(--aztec-graphite)]/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Stake / Withdraw</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                stAZTEC
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Available balance
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">-- AZTEC</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Input amount
                </p>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  <span className="text-white/80">0.0</span>
                  <span className="text-xs uppercase text-white/40">AZTEC</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5">
                  Stake
                </button>
                <button className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
                  Request
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.25em] text-white/50">
                Protocol Snapshot
              </h3>
              <div className="mt-6 grid gap-4">
                <div className="flex items-center justify-between text-white/80">
                  <span>Exchange rate</span>
                  <span className="font-mono text-white">--</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span>APY</span>
                  <span className="font-mono text-white">--</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span>Total staked</span>
                  <span className="font-mono text-white">--</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.25em] text-white/50">
                Withdrawal Queue
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white/80">
                  <span>Latest request</span>
                  <span className="text-xs text-[var(--aztec-mint)]">--</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white/60">
                  <span>Next up</span>
                  <span className="text-xs">--</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 text-xs uppercase tracking-[0.3em] text-white/40 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            Contracts: StakedAztecToken / LiquidStakingCore / WithdrawalQueue
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            Network: Local sandbox
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            Next: wire UI to contract calls
          </div>
        </section>
      </main>
    </div>
  );
}
