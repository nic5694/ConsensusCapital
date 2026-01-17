import requests
import pandas as pd

def get_top_market_slugs(k):
    gamma_url = f"https://gamma-api.polymarket.com/markets?order=volume&ascending=false"
    resp = requests.get(gamma_url, params={"limit": k, "active": "true"})
    resp.raise_for_status()
    markets = resp.json()
    slugs = []
    for market in markets:
        slugs.append(market["slug"])
    return slugs

def get_market_history_by_slug(slug, resample_interval="H"):

    gamma_url = "https://gamma-api.polymarket.com/markets"
    resp = requests.get(gamma_url, params={"slug": slug})
    resp.raise_for_status()

    markets = resp.json()
    if not markets:
        raise ValueError("Market not found")

    # I'm not sure why you need this
    market = markets[0]

    # Get YES token ID for CLOB
    yes_token_id = market["clobTokenIds"][2:-2].split('", "')[0]

    # Fetch historical prices
    history_url = "https://clob.polymarket.com/prices-history"
    params = {
        "market": yes_token_id,
        "interval": "max"
    }

    resp = requests.get(history_url, params=params)
    resp.raise_for_status()
    history = resp.json().get("history", [])
    if not history:
        return None, None

    # Fix: don't assign the return value of set_index(..., inplace=True).
    # Convert 't' to datetime (seconds since epoch) and set it as the index.
    history = pd.DataFrame(history)
    history['t'] = pd.to_datetime(history['t'], unit='s')
    history = history.set_index('t')

    history = history.resample(resample_interval).mean()

    timestamps = list(history.index)
    prices = history["p"]

    return timestamps, prices

def get_top_market_histories(k):
    slugs = get_top_market_slugs(k)
    out = []
    for slug in slugs:
        history = get_market_history_by_slug(slug, "H")
        #if history != (None, None):
        out.append(history)

    return out

if __name__ == "__main__":
    history = get_top_market_histories(10)
    # N x C x T
    print("History: " + str(history[1]))
    'cbb-umbc-coppst-2025-12-29-spread-away-11pt5'
    #import plot
    #timestamps, market_prices = get_market_history_by_slug("msft-above-480-on-january-30-2026", "H")
    #plot.plot_history(timestamps, market_prices, "Market Price History")
    from correlate import *
