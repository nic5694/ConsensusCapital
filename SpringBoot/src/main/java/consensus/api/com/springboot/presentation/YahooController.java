package consensus.api.com.springboot.presentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import consensus.api.com.springboot.buisness.DTO.StockDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/yahoo")
@CrossOrigin(origins = {"http://localhost:8090", "https://mchacks.benmusicgeek.synology.me"})
public class YahooController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/symbols")
    public List<StockDTO> searchSymbols(@RequestParam String query) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        headers.set("Accept", "application/json");
        headers.set("Accept-Language", "en-US,en;q=0.9");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String searchUrl = UriComponentsBuilder
                    .fromHttpUrl("https://query2.finance.yahoo.com/v1/finance/search")
                    .queryParam("q", query)
                    .queryParam("quotesCount", 10)
                    .queryParam("newsCount", 0)
                    .toUriString();

            ResponseEntity<String> response =
                    restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode quotes = root.path("quotes");

            List<StockDTO> results = new ArrayList<>();

            for (JsonNode quote : quotes) {

                // Sécurité : ignorer si pas une action
                if (!"EQUITY".equals(quote.path("quoteType").asText())) {
                    continue;
                }

                results.add(new StockDTO(
                        quote.path("symbol").asText(),
                        quote.path("shortname").asText(null),
                        quote.path("exchDisp").asText(null),
                        quote.path("regularMarketPrice").isNumber()
                                ? quote.path("regularMarketPrice").asDouble()
                                : null
                ));
            }

            return results;

        } catch (Exception e) {
            log.error("Error while searching Yahoo symbols for query: {}", query, e);
            return List.of();
        }
    }

}
