package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.buisness.DTO.StockDTO;
import consensus.api.com.springboot.buisness.DTO.StockInfoDTO;

public interface StockService {
    StockDTO searchAndGetPrice(String stockSymbol);

    StockInfoDTO searchAndGetInfo(String stockSymbol);
}
