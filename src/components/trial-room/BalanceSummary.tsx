interface BalanceSummaryProps {
  balance: number;
  totalValue: number;
  roi: number;
  currencySymbol?: string;
}

const BalanceSummary = ({ balance, totalValue, roi, currencySymbol = "$" }: BalanceSummaryProps) => {
  return (
    <div className="flex flex-col md:items-end space-y-2 w-full md:w-auto">
      <div className="bg-muted p-3 rounded-lg">
        <div className="text-lg">Available Balance</div>
        <div className="text-2xl font-bold">{currencySymbol}{balance.toLocaleString()}</div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span>Total Value:</span>
        <span className="font-bold">{currencySymbol}{totalValue.toLocaleString()}</span>
        <span className={roi >= 0 ? "text-finance-profit" : "text-finance-loss"}>
          ({roi >= 0 ? "+" : ""}{roi.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};

export default BalanceSummary;
