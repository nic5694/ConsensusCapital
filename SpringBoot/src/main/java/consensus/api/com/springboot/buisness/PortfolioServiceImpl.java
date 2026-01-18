package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.data.Portfolio;
import consensus.api.com.springboot.data.PortfolioRepo;
import consensus.api.com.springboot.presentation.request.AssetRequest;
import consensus.api.com.springboot.presentation.responses.AssetResponse;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import consensus.api.com.springboot.buisness.DTO.StockDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;


@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepo portfolioRepo;

    private final StockService stockService;

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

        AssetResponse[] assetResponses = portfolio.getAssets().stream()
                .map(asset -> AssetResponse.builder()
                        .symbol(asset.getSymbol())
                        .name(asset.getName())
                        .quantity(asset.getQuantity())
                        .value(stockService.searchAndGetPrice(asset.getSymbol()).price())
                        .fullExchangeName(asset.getFullExchangeName())
                        .keywords(asset.getKeywords())
                        .description(asset.getDescription())
                        .build())
                .toArray(AssetResponse[]::new);


        return PortfolioResponse.fromModel(portfolio, assetResponses);
    }

    @Override
    public void addAssetToPortfolio(String userId, AssetRequest assetRequest) {
        Portfolio portfolio = portfolioRepo.findByUserId(userId);

        if (portfolio == null) {
            createPortfolio(userId);
        }

        portfolio = portfolioRepo.findByUserId(userId);

        StockDTO stock = stockService.searchAndGetPrice(assetRequest.getSymbol());

        if (stock == null) {
            return;
        }

        // If asset already exists, update quantity
        for (var asset : portfolio.getAssets()) {
            if (asset.getSymbol().equalsIgnoreCase(assetRequest.getSymbol())) {
                asset.setQuantity(asset.getQuantity() + assetRequest.getQuantity());
                portfolioRepo.save(portfolio);
                return;
            }
        }

        var asset = assetRequest.toAsset();
        asset.setValue(stock.price());
        asset.setName(stock.name());
        asset.setFullExchangeName(stock.fullExchangeName());

        var stockInfo = stockService.searchAndGetInfo(assetRequest.getSymbol());

        String[] keywords = new String[2];

        keywords[0] = stockInfo.industry();
        keywords[1] = stockInfo.sector();

        String description = stockService.getStockSummary(assetRequest.getSymbol());

        asset.setDescription(description);
        asset.setKeywords(keywords);
        portfolio.getAssets().add(asset);
        portfolioRepo.save(portfolio);

    }

    @Override
    public void removeAssetFromPortfolio(String userId, String assetSymbol) {
        Portfolio portfolio = portfolioRepo.findByUserId(userId);
        if (portfolio != null) {
            portfolio.getAssets().removeIf(asset -> asset.getSymbol().equalsIgnoreCase(assetSymbol));
            portfolioRepo.save(portfolio);
        }
    }


}
