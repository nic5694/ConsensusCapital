package consensus.api.com.springboot.buisness;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import consensus.api.com.springboot.presentation.responses.StockDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
public class StockServiceImpl implements StockService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();


    @Override
    public StockDTO searchAndGetPrice(String symbolQuery) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        headers.set("Accept", "application/json");
        headers.set("Accept-Language", "en-US,en;q=0.9");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            log.info("Searching stock data for symbol: {}", symbolQuery);

            String chartUrl = UriComponentsBuilder
                    .fromHttpUrl("https://query2.finance.yahoo.com/v8/finance/chart/" + symbolQuery)
                    .queryParam("interval", "1d")
                    .queryParam("range", "1d")
                    .toUriString();

            ResponseEntity<String> chartResponse =
                    restTemplate.exchange(chartUrl, HttpMethod.GET, entity, String.class);

            JsonNode chartRoot = objectMapper.readTree(chartResponse.getBody());
            JsonNode metaNode = chartRoot
                    .path("chart")
                    .path("result")
                    .path(0)
                    .path("meta");

            String name = metaNode.path("shortName").asText(null);
            Double price = metaNode.path("regularMarketPrice").isNumber()
                    ? metaNode.path("regularMarketPrice").asDouble()
                    : null;

            log.info("Stock result → symbol={}, name={}, price={}", symbolQuery, name, price);

            return new StockDTO(
                    symbolQuery,
                    name,
                    metaNode.path("exchangeName").asText(null),
                    price,
                    metaNode.path("currency").asText(null)
            );

        } catch (Exception e) {
            log.error("Error while fetching stock data for symbol: {}", symbolQuery, e);
            return null;
        }
    }

}
