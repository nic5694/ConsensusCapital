import scipy
import numpy as np

def max_norm_correlate(a, b):
    # normalize
    a_norm = (a - a.mean()) / a.std()
    b_norm = (b - b.mean()) / b.std()

    corr = scipy.signal.correlate(a_norm, b_norm, mode='full') / len(a)
    # max value corresponds to strongest correlation at any lag
    max_corr = np.max(corr)
    return max_corr
