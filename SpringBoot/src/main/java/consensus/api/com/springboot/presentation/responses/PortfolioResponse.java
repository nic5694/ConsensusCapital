package consensus.api.com.springboot.presentation.responses;

import consensus.api.com.springboot.data.Portfolio;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
public class PortfolioResponse {
    private String portfolioId;
    private String userId;
    private double totalValue;
    private AssetResponse[] assets;

    public static PortfolioResponse fromModel(Portfolio portfolio, AssetResponse[] assetResponses) {

        double totalValue = portfolio.getAssets().stream()
                .mapToDouble(asset -> asset.getValue() * asset.getQuantity())
                .sum();

        totalValue = Math.round(totalValue * 100.0) / 100.0;

        return PortfolioResponse.builder()
                .portfolioId(portfolio.getId())
                .userId(portfolio.getUserId())
                .totalValue(totalValue)
                .assets(assetResponses)
                .build();
    }
}
