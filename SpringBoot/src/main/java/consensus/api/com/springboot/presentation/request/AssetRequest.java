package consensus.api.com.springboot.presentation.request;


import consensus.api.com.springboot.data.Asset;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
public class AssetRequest {
    private String symbol;
    private double quantity;

    public Asset toAsset() {
        return Asset.builder()
                .symbol(this.symbol)
                .quantity(this.quantity)
                .build();
    }
}
