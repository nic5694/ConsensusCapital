package consensus.api.com.springboot.buisness;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeminiServiceImpl implements GeminiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Override
    public List<List<Double>> embed(List<String> texts) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-goog-api-key", apiKey);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

        try {
            List<List<Double>> allEmbeddings = new ArrayList<>(texts.size());

            for (String text : texts) {
                // Build request body for ONE text
                var rootNode = objectMapper.createObjectNode();
                var contentNode = rootNode.putObject("content");
                var partsArray = contentNode.putArray("parts");

                partsArray.addObject().put("text", text);
                rootNode.put("taskType", "SEMANTIC_SIMILARITY");

                String bodyContent = objectMapper.writeValueAsString(rootNode);
                HttpEntity<String> entity = new HttpEntity<>(bodyContent, headers);

                ResponseEntity<String> response =
                        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode values = root.path("embedding").path("values");

                List<Double> embedding = new ArrayList<>(values.size());
                for (JsonNode v : values) {
                    embedding.add(v.asDouble());
                }

                allEmbeddings.add(embedding);
            }

            return allEmbeddings;

        } catch (Exception e) {
            throw new RuntimeException("Failed to embed content using Gemini", e);
        }
    }
}
