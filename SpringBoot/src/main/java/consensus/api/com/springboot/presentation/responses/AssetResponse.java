package consensus.api.com.springboot.presentation.responses;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
public class AssetResponse {
    private String symbol;
    private String name;
    private double quantity;
    private double value;
    private String[] keywords;
    private String description;
}
