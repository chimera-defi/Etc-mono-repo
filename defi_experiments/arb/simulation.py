"""
Arbitrage Opportunity Simulation

This script simulates various market conditions to test arbitrage profitability
without requiring real blockchain interactions or funds.
"""

import asyncio
from decimal import Decimal
from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import random


@dataclass
class MarketState:
    """Represents the state of a market at a point in time."""
    timestamp: datetime
    token_pair: Tuple[str, str]
    dex_prices: Dict[str, Decimal]
    gas_price_gwei: Decimal
    
    def price_spread(self) -> Decimal:
        """Calculate the price spread across DEXes."""
        prices = list(self.dex_prices.values())
        return max(prices) - min(prices)
    
    def best_buy_dex(self) -> str:
        """Identify DEX with lowest price."""
        return min(self.dex_prices, key=self.dex_prices.get)
    
    def best_sell_dex(self) -> str:
        """Identify DEX with highest price."""
        return max(self.dex_prices, key=self.dex_prices.get)


@dataclass
class ArbitrageOpportunity:
    """Represents a potential arbitrage opportunity."""
    market_state: MarketState
    buy_dex: str
    sell_dex: str
    buy_price: Decimal
    sell_price: Decimal
    gross_profit_per_unit: Decimal
    estimated_gas_cost_usd: Decimal
    trade_size: Decimal
    
    def net_profit(self) -> Decimal:
        """Calculate net profit after gas costs."""
        gross_profit = self.gross_profit_per_unit * self.trade_size
        return gross_profit - self.estimated_gas_cost_usd
    
    def is_profitable(self, min_profit_threshold: Decimal = Decimal("10")) -> bool:
        """Check if opportunity meets minimum profit threshold."""
        return self.net_profit() > min_profit_threshold
    
    def roi_percentage(self) -> Decimal:
        """Calculate return on investment percentage."""
        investment = self.buy_price * self.trade_size
        return (self.net_profit() / investment) * Decimal("100") if investment > 0 else Decimal("0")


class ArbitrageSimulator:
    """Simulates arbitrage opportunities under various market conditions."""
    
    def __init__(self, gas_price_eth: Decimal = Decimal("0.001")):
        self.gas_price_eth = gas_price_eth
        self.opportunities_found: List[ArbitrageOpportunity] = []
        
    def generate_market_state(
        self, 
        token_pair: Tuple[str, str] = ("ETH", "USDC"),
        base_price: Decimal = Decimal("2000"),
        volatility: float = 0.02
    ) -> MarketState:
        """
        Generate a random market state with price variations across DEXes.
        
        Args:
            token_pair: The token pair to simulate
            base_price: Base price for the token pair
            volatility: Price volatility factor (0-1)
        
        Returns:
            MarketState object with randomized prices
        """
        timestamp = datetime.now()
        
        # Generate prices for different DEXes with some randomness
        dex_prices = {
            "UniswapV2": base_price * (Decimal("1") + Decimal(str(random.gauss(0, volatility)))),
            "UniswapV3": base_price * (Decimal("1") + Decimal(str(random.gauss(0, volatility)))),
            "SushiSwap": base_price * (Decimal("1") + Decimal(str(random.gauss(0, volatility)))),
            "Curve": base_price * (Decimal("1") + Decimal(str(random.gauss(0, volatility)))),
        }
        
        # Ensure all prices are positive
        dex_prices = {dex: max(price, Decimal("1")) for dex, price in dex_prices.items()}
        
        gas_price_gwei = Decimal(str(random.uniform(10, 100)))
        
        return MarketState(
            timestamp=timestamp,
            token_pair=token_pair,
            dex_prices=dex_prices,
            gas_price_gwei=gas_price_gwei
        )
    
    def analyze_opportunity(
        self, 
        market_state: MarketState,
        trade_size: Decimal = Decimal("1"),
        eth_price_usd: Decimal = Decimal("2000")
    ) -> ArbitrageOpportunity:
        """
        Analyze a market state for arbitrage opportunities.
        
        Args:
            market_state: Current market state
            trade_size: Size of trade to execute
            eth_price_usd: Current ETH price in USD for gas calculation
        
        Returns:
            ArbitrageOpportunity object
        """
        buy_dex = market_state.best_buy_dex()
        sell_dex = market_state.best_sell_dex()
        buy_price = market_state.dex_prices[buy_dex]
        sell_price = market_state.dex_prices[sell_dex]
        
        gross_profit_per_unit = sell_price - buy_price
        
        # Estimate gas cost (typical arbitrage uses ~300k gas)
        gas_units = Decimal("300000")
        gas_cost_eth = self.gas_price_eth * (market_state.gas_price_gwei / Decimal("100"))
        gas_cost_usd = gas_cost_eth * eth_price_usd
        
        opportunity = ArbitrageOpportunity(
            market_state=market_state,
            buy_dex=buy_dex,
            sell_dex=sell_dex,
            buy_price=buy_price,
            sell_price=sell_price,
            gross_profit_per_unit=gross_profit_per_unit,
            estimated_gas_cost_usd=gas_cost_usd,
            trade_size=trade_size
        )
        
        return opportunity
    
    def run_simulation(
        self,
        num_iterations: int = 100,
        token_pair: Tuple[str, str] = ("ETH", "USDC"),
        base_price: Decimal = Decimal("2000"),
        volatility: float = 0.02,
        trade_size: Decimal = Decimal("1")
    ) -> Dict:
        """
        Run arbitrage simulation over multiple iterations.
        
        Args:
            num_iterations: Number of market states to simulate
            token_pair: Token pair to simulate
            base_price: Base price for the pair
            volatility: Market volatility factor
            trade_size: Trade size per opportunity
        
        Returns:
            Dictionary with simulation results
        """
        profitable_opportunities = 0
        total_profit = Decimal("0")
        total_opportunities = num_iterations
        
        self.opportunities_found = []
        
        for i in range(num_iterations):
            # Generate market state
            market_state = self.generate_market_state(token_pair, base_price, volatility)
            
            # Analyze opportunity
            opportunity = self.analyze_opportunity(market_state, trade_size)
            
            self.opportunities_found.append(opportunity)
            
            if opportunity.is_profitable():
                profitable_opportunities += 1
                total_profit += opportunity.net_profit()
        
        # Calculate statistics
        profitability_rate = (profitable_opportunities / total_opportunities) * 100
        avg_profit = total_profit / Decimal(str(profitable_opportunities)) if profitable_opportunities > 0 else Decimal("0")
        
        return {
            "total_opportunities_analyzed": total_opportunities,
            "profitable_opportunities": profitable_opportunities,
            "profitability_rate_pct": float(profitability_rate),
            "total_profit_usd": float(total_profit),
            "average_profit_per_opportunity_usd": float(avg_profit),
            "parameters": {
                "token_pair": token_pair,
                "base_price": float(base_price),
                "volatility": volatility,
                "trade_size": float(trade_size),
            }
        }
    
    def get_best_opportunities(self, top_n: int = 10) -> List[ArbitrageOpportunity]:
        """Get the top N most profitable opportunities from last simulation."""
        sorted_opps = sorted(
            [opp for opp in self.opportunities_found if opp.is_profitable()],
            key=lambda x: x.net_profit(),
            reverse=True
        )
        return sorted_opps[:top_n]
    
    def print_opportunity_report(self, opportunity: ArbitrageOpportunity):
        """Print detailed report for an arbitrage opportunity."""
        print(f"\n{'='*60}")
        print(f"ARBITRAGE OPPORTUNITY REPORT")
        print(f"{'='*60}")
        print(f"Token Pair: {opportunity.market_state.token_pair}")
        print(f"Timestamp: {opportunity.market_state.timestamp}")
        print(f"\nBUY:  {opportunity.buy_dex:<15} @ ${opportunity.buy_price:,.2f}")
        print(f"SELL: {opportunity.sell_dex:<15} @ ${opportunity.sell_price:,.2f}")
        print(f"\nTrade Size: {opportunity.trade_size} units")
        print(f"Gross Profit: ${opportunity.gross_profit_per_unit * opportunity.trade_size:,.2f}")
        print(f"Gas Cost: ${opportunity.estimated_gas_cost_usd:,.2f}")
        print(f"Net Profit: ${opportunity.net_profit():,.2f}")
        print(f"ROI: {opportunity.roi_percentage():.2f}%")
        print(f"\nProfitable: {'✓ YES' if opportunity.is_profitable() else '✗ NO'}")
        print(f"{'='*60}\n")


def run_basic_simulation():
    """Run a basic arbitrage simulation."""
    print("Starting Arbitrage Simulation...\n")
    
    simulator = ArbitrageSimulator()
    
    # Run simulation with different volatility levels
    volatility_levels = [0.01, 0.02, 0.05]
    
    for volatility in volatility_levels:
        print(f"\n{'='*60}")
        print(f"SIMULATION: Volatility = {volatility*100}%")
        print(f"{'='*60}")
        
        results = simulator.run_simulation(
            num_iterations=100,
            volatility=volatility,
            trade_size=Decimal("1")
        )
        
        print(f"\nResults:")
        print(f"  Total Opportunities Analyzed: {results['total_opportunities_analyzed']}")
        print(f"  Profitable Opportunities: {results['profitable_opportunities']}")
        print(f"  Profitability Rate: {results['profitability_rate_pct']:.2f}%")
        print(f"  Total Profit: ${results['total_profit_usd']:,.2f}")
        print(f"  Average Profit per Opportunity: ${results['average_profit_per_opportunity_usd']:,.2f}")
        
        # Show top 3 opportunities
        top_opportunities = simulator.get_best_opportunities(3)
        if top_opportunities:
            print(f"\n  Top 3 Opportunities:")
            for i, opp in enumerate(top_opportunities, 1):
                print(f"    {i}. {opp.buy_dex} → {opp.sell_dex}: ${opp.net_profit():,.2f} profit")


def run_flash_loan_simulation():
    """Run simulation for flash loan arbitrage opportunities."""
    print("\n\n" + "="*60)
    print("FLASH LOAN ARBITRAGE SIMULATION")
    print("="*60)
    
    simulator = ArbitrageSimulator()
    
    # Flash loan allows much larger trade sizes
    flash_loan_amount = Decimal("100000")  # $100k flash loan
    flash_loan_fee = Decimal("0.0009")     # 0.09% fee (Aave)
    
    results = simulator.run_simulation(
        num_iterations=50,
        volatility=0.015,
        trade_size=flash_loan_amount / Decimal("2000")  # Convert to ETH
    )
    
    print(f"\nFlash Loan Parameters:")
    print(f"  Loan Amount: ${float(flash_loan_amount):,.2f}")
    print(f"  Loan Fee: {float(flash_loan_fee * 100):.2f}%")
    
    print(f"\nResults:")
    print(f"  Profitable Opportunities: {results['profitable_opportunities']}")
    print(f"  Profitability Rate: {results['profitability_rate_pct']:.2f}%")
    print(f"  Total Profit: ${results['total_profit_usd']:,.2f}")
    
    # Adjust for flash loan fees
    flash_loan_cost = flash_loan_amount * flash_loan_fee * Decimal(str(results['profitable_opportunities']))
    adjusted_profit = Decimal(str(results['total_profit_usd'])) - flash_loan_cost
    
    print(f"  Flash Loan Fees: ${float(flash_loan_cost):,.2f}")
    print(f"  Net Profit (after fees): ${float(adjusted_profit):,.2f}")


def main():
    """Main entry point for simulation."""
    random.seed(42)  # For reproducibility
    
    run_basic_simulation()
    run_flash_loan_simulation()
    
    print("\n\n" + "="*60)
    print("SIMULATION COMPLETE")
    print("="*60)
    print("\nKey Takeaways:")
    print("  1. Higher volatility = more arbitrage opportunities")
    print("  2. Gas costs significantly impact profitability")
    print("  3. Flash loans enable capital-free arbitrage")
    print("  4. Most opportunities require fast execution (MEV)")
    print("  5. Real-world success requires sophisticated infrastructure")
    print("\nNext Steps:")
    print("  - Run tests: pytest tests/test_arbitrage_profitability.py")
    print("  - Configure bot: Edit bots/arbitrage.py with your parameters")
    print("  - Deploy cautiously: Start with small amounts on testnet")
    print()


if __name__ == "__main__":
    main()
