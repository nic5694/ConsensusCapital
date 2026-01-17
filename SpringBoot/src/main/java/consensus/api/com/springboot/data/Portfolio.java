package consensus.api.com.springboot.data;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
@Document(collection = "inventories")
public class Portfolio {
    @Id
    private String id;
    private String userId;

    private List<Asset> assets;
}
