package consensus.api.com.springboot.buisness.DTO;

import java.util.List;

public record PolyMarketInfoDTO(
        String id,
        String title,
        String description,
        List<MarketDTO> markets
) {}
