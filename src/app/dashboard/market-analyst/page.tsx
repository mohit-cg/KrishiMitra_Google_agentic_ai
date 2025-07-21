import { MarketAnalystClient } from "./_components/market-analyst-client";

export default function MarketAnalystPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Market Analyst</h1>
      <p className="text-muted-foreground mb-8">
        Get real-time market price analysis and recommendations. Ask a question like "What is the price of onions in Pune Mandi?"
      </p>
      <MarketAnalystClient />
    </div>
  );
}
