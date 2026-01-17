package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.presentation.request.AssetRequest;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;

public interface PortfolioService {
    void createPortfolio(String userId);

    PortfolioResponse fetchPortfolio(String userId);

    void addAssetToPortfolio(String userId, AssetRequest assetRequest);

    void removeAssetFromPortfolio(String userId, String assetSymbol);
}
