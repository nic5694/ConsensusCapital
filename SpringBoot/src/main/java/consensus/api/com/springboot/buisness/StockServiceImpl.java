package consensus.api.com.springboot.buisness;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import consensus.api.com.springboot.buisness.DTO.StockDTO;
import consensus.api.com.springboot.buisness.DTO.StockInfoDTO;
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
                    price
            );

        } catch (Exception e) {
            log.error("Error while fetching stock data for symbol: {}", symbolQuery, e);
            return null;
        }
    }

    @Override
    public StockInfoDTO searchAndGetInfo(String symbolQuery) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        headers.set("Accept", "application/json");
        headers.set("Accept-Language", "en-US,en;q=0.9");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            log.info("Searching stock info for symbol: {}", symbolQuery);

            String searchUrl = UriComponentsBuilder
                    .fromHttpUrl("https://query2.finance.yahoo.com/v1/finance/search")
                    .queryParam("q", symbolQuery)
                    .queryParam("quotesCount", 1)
                    .queryParam("newsCount", 0)
                    .toUriString();

            ResponseEntity<String> response =
                    restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode quoteNode = root
                    .path("quotes")
                    .path(0);

            String sector = quoteNode.path("sector").asText(null);
            String industry = quoteNode.path("industry").asText(null);

            log.info("Stock info → symbol={}, sector={}, industry={}",
                    symbolQuery, sector, industry);

            return new StockInfoDTO(sector, industry);

        } catch (Exception e) {
            log.error("Error while fetching stock info for symbol: {}", symbolQuery, e);
            return null;
        }
    }

    @Override
    public String getStockSummary(String stockSymbol) {
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String searchUrl = UriComponentsBuilder
                    .fromHttpUrl("http://python:8000/summary/" + stockSymbol)
                    .toUriString();

            ResponseEntity<String> response =
                    restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);

            return response.getBody();

        } catch (Exception e) {
            log.error("Error while fetching stock info for symbol: {}", stockSymbol, e);
            return null;
        }
    }
}
