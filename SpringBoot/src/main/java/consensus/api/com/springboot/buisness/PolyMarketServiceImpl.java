package consensus.api.com.springboot.buisness;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PolyMarketServiceImpl implements PolyMarketService{
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<PolyMarketInfoDTO> getMarketInfo() {
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String searchUrl = UriComponentsBuilder
                    .fromHttpUrl("https://gamma-api.polymarket.com/events?closed=false&limit=50&order=volume24hr")
                    .toUriString();

            ResponseEntity<String> response =
                    restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());

            List<PolyMarketInfoDTO> results = new java.util.ArrayList<>();

            for (JsonNode node : root) {
                String id = node.path("id").asText();
                String title = node.path("title").asText();
                String description = node.path("description").asText();

                results.add(new PolyMarketInfoDTO(id, title, description));
            }

            return results;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch market info from PolyMarket", e);
        }
    }
}
