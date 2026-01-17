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
    private String name;
    private int quantity;
    private double value;
    private String[] keywords;
    private String description;

    public Asset toAsset() {
        return Asset.builder()
                .symbol(this.symbol)
                .name(this.name)
                .quantity(this.quantity)
                .value(this.value)
                .keywords(this.keywords)
                .description(this.description)
                .build();
    }
}
