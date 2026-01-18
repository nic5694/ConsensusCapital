package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.presentation.responses.StockDTO;
import consensus.api.com.springboot.presentation.responses.StockInfoDTO;

public interface StockService {
    StockDTO searchAndGetPrice(String stockSymbol);

    StockInfoDTO searchAndGetInfo(String stockSymbol);
}
