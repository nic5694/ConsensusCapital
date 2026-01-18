package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;

import java.util.List;

public interface PolyMarketService {
    List<PolyMarketInfoDTO> getMarketInfo();
}
