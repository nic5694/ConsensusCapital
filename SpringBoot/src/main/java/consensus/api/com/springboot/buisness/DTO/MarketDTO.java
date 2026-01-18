package consensus.api.com.springboot.buisness.DTO;

import java.util.List;

public record MarketDTO(
        String id,
        String question,
        String image,
        List<OutcomePriceDTO> selections
) {}
