package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.presentation.responses.StockDTO;

public interface StockService {
    StockDTO searchAndGetPrice(String stockSymbol);
}
