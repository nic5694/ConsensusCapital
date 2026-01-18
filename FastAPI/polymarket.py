import requests
import pandas as pd
from tqdm import tqdm
from correlate import * 


def get_top_markets(k, resample_interval="h"):
    gamma_url = "https://gamma-api.polymarket.com/markets"
    resp = requests.get(gamma_url, params={"order": "volume", "ascending": "false", "limit": k, "closed": "false", "active": "true"})
    resp.raise_for_status()
    markets = resp.json() or []

    for market in markets:
        try:
            # Get YES token ID for CLOB (defensive)
            yes_token_id = market.get("clobTokenIds", "")[2:-2].split('", "')[0]
            if not yes_token_id:
                market["history"] = []
                continue

            # Fetch historical prices
            history_url = "https://clob.polymarket.com/prices-history"
            hresp = requests.get(history_url, params={"market": yes_token_id, "interval": "max"}, timeout=5)
            hresp.raise_for_status()
            raw_history = hresp.json().get("history", []) or []
            if not raw_history: # history doesn't exist
                market["history"] = []
                continue

            # DataFrame, set datetime as index, resample and take mean
            df = pd.DataFrame(raw_history)
            df["t"] = pd.to_datetime(df["t"], unit="s")
            df = df.set_index("t")
            df = df.resample(resample_interval).mean()

            # Convert to JSON-serializable list of records: [{"t": "...", "p": 0.123}, ...]
            if "p" in df.columns:
                recs = df["p"].dropna().rename_axis("t").reset_index()
                recs["t"] = recs["t"].astype(str)          # ISO-like string
                recs["p"] = recs["p"].astype(float)
                market["history"] = recs.to_dict(orient="records")
            else:
                market["history"] = []

        except Exception:
            market["history"] = []

    return markets

def get_top_correlating_markets(stock_history, num_markets):
    top_markets = get_top_markets(5000, "h")

    for market in tqdm(top_markets):
        df = pd.DataFrame(market["history"])

        if df.empty:
            market["correlation"] = 0
        else:
            correlation = max_norm_correlate(stock_history["Close"], df["p"])
            market["correlation"] = correlation
    
    top_markets_df = pd.DataFrame(top_markets)
    top_markets_df["abs_correlation"] = top_markets_df["correlation"].abs()
    top_markets_df = top_markets_df.sort_values("abs_correlation", ascending=False)
    keep_cols = ["question", "slug", "category", "description", "history", "correlation", "abs_correlation"]
    top_markets_df = top_markets_df.loc[:, top_markets_df.columns.isin(keep_cols)]
    return top_markets_df[:num_markets]

if __name__ == "__main__":
    pass