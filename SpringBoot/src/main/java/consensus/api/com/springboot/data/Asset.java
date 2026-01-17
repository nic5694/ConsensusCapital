package consensus.api.com.springboot.data;

import lombok.*;
import org.springframework.data.annotation.Id;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
public class Asset {
    @Id
    private String id;
    private String symbol;
    private String name;
    private int quantity;
    private double value;
    private String[] keywords;
    private String description;
}

