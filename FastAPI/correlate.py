import numpy as np
from scipy.stats import pearsonr

def max_norm_correlate(stock, market, max_lag=7, lag_penalty=0.1):
    # returns
    x = np.diff(np.log(stock))
    y = np.diff(np.log(market))

    best = 0
    for lag in range(-max_lag, max_lag + 1):
        if lag < 0:
            xs, ys = x[:lag], y[-lag:]
        elif lag > 0:
            xs, ys = x[lag:], y[:-lag]
        else:
            xs, ys = x, y
        
        n = min(len(xs), len(ys))
        if n < 5:
            continue

        r, _ = pearsonr(xs[:n], ys[:n])
        best = max(best, abs(r))

    return best
