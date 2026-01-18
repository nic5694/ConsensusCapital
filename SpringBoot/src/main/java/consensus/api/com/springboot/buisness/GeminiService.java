package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;

import java.util.List;

public interface GeminiService {
    List<List<Double>> embed(List<String> texts);
}
