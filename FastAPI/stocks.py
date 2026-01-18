import yfinance as yf
from polymarket import get_top_correlating_markets

# Define the ticker symbol
ticker_symbol = "MSFT"

# Create a Ticker object
ticker = yf.Ticker(ticker_symbol)

# Fetch historical market data for the last 30 days
history = ticker.history(period="1mo")  # data for the last month

history = history.resample("h").mean()

history["Close"].interpolate(method="time", inplace=True)  # optional linear interpolation

df = get_top_correlating_markets(history, 100)
df.to_csv("correlators.csv", sep='\t', encoding='utf-8')

# plot_history(timestamps, stock_prices, "Stock Prices")
#stock_prices = stock_prices[:-8]