package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.data.Portfolio;
import consensus.api.com.springboot.data.PortfolioRepo;
import consensus.api.com.springboot.presentation.request.AssetRequest;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;


@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepo portfolioRepo;

    @Override
    public void createPortfolio(String userId) {
        Portfolio portfolio = Portfolio.builder()
                .userId(userId)
                .assets(new ArrayList<>())
                .build();

        if (portfolioRepo.findByUserId(userId) != null) {
            return;
        }

        portfolioRepo.save(portfolio);
    }

    @Override
    public PortfolioResponse fetchPortfolio(String userId) {
        Portfolio portfolio = portfolioRepo.findByUserId(userId);
        return PortfolioResponse.fromModel(portfolio);
    }

    @Override
    public void addAssetToPortfolio(String userId, AssetRequest assetRequest) {
        Portfolio portfolio = portfolioRepo.findByUserId(userId);
        if (portfolio != null) {
            portfolio.getAssets().add(assetRequest.toAsset());
            portfolioRepo.save(portfolio);
        }

    }


}
