from fastapi import FastAPI
import uvicorn
import yfinance as yf

app = FastAPI()

@app.get("/summary/{ticker_symbol}")
async def get_long_business_summary(ticker_symbol: str):
    ticker = yf.Ticker(ticker_symbol)
    return ticker.get_info().get("longBusinessSummary")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
