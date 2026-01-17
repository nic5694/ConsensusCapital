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
    private AssetResponse[] assets;

    public static PortfolioResponse fromModel(Portfolio portfolio) {
        AssetResponse[] assetResponses = portfolio.getAssets().stream()
                .map(asset -> AssetResponse.builder()
                        .symbol(asset.getSymbol())
                        .name(asset.getName())
                        .quantity(asset.getQuantity())
                        .value(asset.getValue())
                        .keywords(asset.getKeywords())
                        .description(asset.getDescription())
                        .build())
                .toArray(AssetResponse[]::new);

        return PortfolioResponse.builder()
                .portfolioId(portfolio.getId())
                .userId(portfolio.getUserId())
                .assets(assetResponses)
                .build();
    }
}
