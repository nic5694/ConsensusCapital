package consensus.api.com.springboot.buisness;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import java.util.List;

@Service
public class StockService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    public record StockDTO(String symbol, String name, String exchange, Double price, String currency) {}
    public List<StockDTO> searchAndGetPrices(String query) {
        // Required to pass the 403 Forbidden error from Yahoo Finance because we are not using an official API ;)
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            String searchUrl = "https://query2.finance.yahoo.com/v1/finance/search?q=" + query + "&quotesCount=10&newsCount=0";
            ResponseEntity<String> searchResponse = restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);
            JsonNode searchRoot = objectMapper.readTree(searchResponse.getBody());
            List<String> symbols = new ArrayList<>();
            if (searchRoot.has("quotes")) {
                for (JsonNode node : searchRoot.get("quotes")) {
                    String type = node.path("quoteType").asText();
                    // Filter: Filter for EQUITY and ETF types only
                    if ("EQUITY".equals(type) || "ETF".equals(type)) {
                        symbols.add(node.get("symbol").asText());
                    }
                }
            }
            if (symbols.isEmpty()) {
                return Collections.emptyList();
            }
            String joinedSymbols = String.join(",", symbols);
            String quoteUrl = "https://query2.finance.yahoo.com/v7/finance/quote?symbols=" + joinedSymbols;

            ResponseEntity<String> quoteResponse = restTemplate.exchange(quoteUrl, HttpMethod.GET, entity, String.class);
            JsonNode quoteRoot = objectMapper.readTree(quoteResponse.getBody());

            List<StockDTO> results = new ArrayList<>();
            JsonNode quoteResultNode = quoteRoot.path("quoteResponse").path("result");

            if (quoteResultNode.isArray()) {
                for (JsonNode item : quoteResultNode) {
                    String symbol = item.path("symbol").asText();
                    String name = item.path("shortName").asText(item.path("longName").asText("Unknown"));
                    String exchange = item.path("fullExchangeName").asText();
                    String currency = item.path("currency").asText();
                    Double price = item.has("regularMarketPrice") ? item.get("regularMarketPrice").asDouble() : null;
                    results.add(new StockDTO(symbol, name, exchange, price, currency));
                }
            }
            return results;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
