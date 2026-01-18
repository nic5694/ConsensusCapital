package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisServiceImpl implements AnalysisService {

    private final PolyMarketService polyMarketService;
    private final GeminiService geminiService;
    private final PortfolioService portfolioService;

    private static final double SIMILARITY_THRESHOLD = 0.80;

    @Override
    public void analyzeData(String userId) {
        List<PolyMarketInfoDTO> events = polyMarketService.getMarketInfo();

        PortfolioResponse portfolio = portfolioService.fetchPortfolio(userId);

        List<String> eventTexts = events.stream()
                .map(e -> e.title() + "\n" + e.description() + "\nConsider this as a potential macroeconomic, regulatory, or technological event that could affect stock prices.")
                .toList();

        List<String> assetTexts = Arrays.stream(portfolio.getAssets())
                .map(asset -> String.join(" ", asset.getKeywords()) + "\nConsider this as a representation of the company's business, market position, and growth prospects.")
                .toList();

        List<List<Double>> eventEmbeddings = geminiService.embed(eventTexts);
        List<List<Double>> assetEmbeddings = geminiService.embed(assetTexts);

        if (eventEmbeddings.size() != events.size()) {
            throw new IllegalStateException("Event embeddings count doesn't match event count");
        }
        if (assetEmbeddings.size() != assetTexts.size()) {
            throw new IllegalStateException("Asset embeddings count doesn't match asset count");
        }

        List<EventMatch> matchedEvents = new ArrayList<>();

        for (int i = 0; i < events.size(); i++) {
            PolyMarketInfoDTO event = events.get(i);
            List<Double> eventVec = eventEmbeddings.get(i);

            double bestSim = -1.0;
            int bestAssetIndex = -1;
            boolean thresholdHit = false;

            for (int j = 0; j < assetEmbeddings.size(); j++) {
                double sim = cosineSimilarity(eventVec, assetEmbeddings.get(j));

                if (sim > bestSim) {
                    bestSim = sim;
                    bestAssetIndex = j;
                }

                // EARLY STOP if any asset similarity is above threshold
                if (sim >= SIMILARITY_THRESHOLD) {
                    thresholdHit = true;
                    bestSim = sim;          // keep the first hit score (or keep best so far)
                    bestAssetIndex = j;
                    break;
                }
            }

            if (thresholdHit) {
                matchedEvents.add(new EventMatch(
                        event.id(),
                        event.title(),
                        bestSim,
                        bestAssetIndex
                ));

                log.info("MATCH ✅ event='{}' sim={} matchedAssetIndex={}",
                        event.title(), bestSim, bestAssetIndex);
            } else {
                log.info("NO MATCH ❌ event='{}' bestSim={}", event.title(), bestSim);
            }
        }
        log.info("Total matched events above threshold ({}): {}", SIMILARITY_THRESHOLD, matchedEvents.size());
    }

    /**
     * Cosine similarity for float embeddings
     */
    private double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a.size() != b.size()) throw new IllegalArgumentException("Different vector sizes");

        double dot = 0.0, normA = 0.0, normB = 0.0;

        for (int i = 0; i < a.size(); i++) {
            double x = a.get(i);
            double y = b.get(i);
            dot += x * y;
            normA += x * x;
            normB += y * y;
        }

        double denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom == 0 ? 0 : dot / denom;
    }

    /**
     * Minimal structure to store results.
     * You can turn this into an Entity / DTO as needed.
     */
    public record EventMatch(
            String eventId,
            String eventTitle,
            double similarity,
            int matchedAssetIndex
    ) {}
}
