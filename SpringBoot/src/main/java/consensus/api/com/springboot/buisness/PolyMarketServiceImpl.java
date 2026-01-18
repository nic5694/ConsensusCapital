package consensus.api.com.springboot.buisness;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import consensus.api.com.springboot.buisness.DTO.MarketDTO;
import consensus.api.com.springboot.buisness.DTO.OutcomePriceDTO;
import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolyMarketServiceImpl implements PolyMarketService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<PolyMarketInfoDTO> getMarketInfo() {
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String searchUrl = UriComponentsBuilder
                    .fromHttpUrl("https://gamma-api.polymarket.com/events?closed=false&limit=50&order=volume24hr&active=true")
                    .toUriString();

            ResponseEntity<String> response =
                    restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            List<PolyMarketInfoDTO> results = new ArrayList<>();

            for (JsonNode eventNode : root) {
                String eventId = eventNode.path("id").asText();
                String title = eventNode.path("title").asText();
                String description = eventNode.path("description").asText();
                String eventImage = eventNode.path("image").asText(null);

                List<MarketDTO> markets = new ArrayList<>();
                JsonNode marketsNode = eventNode.path("markets");

                if (marketsNode.isArray()) {
                    for (JsonNode marketNode : marketsNode) {
                        String marketId = marketNode.path("id").asText();
                        String question = marketNode.path("question").asText();
                        String image = marketNode.path("image").asText(eventImage);

                        List<String> outcomes = parseStringJsonArray(marketNode.path("outcomes").asText("[]"));
                        List<String> prices   = parseStringJsonArray(marketNode.path("outcomePrices").asText("[]"));

                        // ✅ keep outcomes even if prices missing
                        List<OutcomePriceDTO> selections = zipKeepAllOutcomes(outcomes, prices);

                        markets.add(new MarketDTO(
                                marketId,
                                question,
                                image,
                                selections
                        ));
                    }
                }

                results.add(new PolyMarketInfoDTO(
                        eventId,
                        title,
                        description,
                        markets
                ));
            }

            return results;
        } catch (Exception e) {
            log.error("Failed to fetch market info from PolyMarket", e);
            throw new RuntimeException("Failed to fetch market info from PolyMarket", e);
        }
    }

    private List<String> parseStringJsonArray(String raw) {
        try {
            if (raw == null || raw.isBlank()) return Collections.emptyList();
            return objectMapper.readValue(raw, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<OutcomePriceDTO> zipKeepAllOutcomes(List<String> outcomes, List<String> pricesRaw) {
        List<OutcomePriceDTO> out = new ArrayList<>(outcomes.size());

        for (int i = 0; i < outcomes.size(); i++) {
            Double price = null;

            if (i < pricesRaw.size()) {
                try {
                    price = Double.parseDouble(pricesRaw.get(i));
                } catch (Exception ignored) {
                }
            }

            out.add(new OutcomePriceDTO(outcomes.get(i), price));
        }

        return out;
    }
}
