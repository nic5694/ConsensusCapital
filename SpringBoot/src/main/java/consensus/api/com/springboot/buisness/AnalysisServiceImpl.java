package consensus.api.com.springboot.buisness;

import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
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

    private static final double SIMILARITY_THRESHOLD = 0.717;

    private static final double UNIQUENESS_MARGIN = 0.02;

    @Override
    public List<PolyMarketInfoDTO> analyzeData(String userId) {

        List<PolyMarketInfoDTO> events = polyMarketService.getMarketInfo();
        PortfolioResponse portfolio = portfolioService.fetchPortfolio(userId);

        List<String> eventTexts = events.stream()
                .map(e -> e.title() + "\n" + e.description())
                .toList();

       List<String> assetTexts = Arrays.stream(portfolio.getAssets())
                .map(asset -> {
                    String desc = asset.getDescription() == null ? "" : asset.getDescription();
                    return String.join("\n", asset.getKeywords()) + "\n" + desc;
                })
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
            double secondBestSim = -1.0;
            int bestAssetIndex = -1;

            for (int j = 0; j < assetEmbeddings.size(); j++) {
                double sim = cosineSimilarity(eventVec, assetEmbeddings.get(j));

                if (sim > bestSim) {
                    secondBestSim = bestSim;
                    bestSim = sim;
                    bestAssetIndex = j;
                } else if (sim > secondBestSim) {
                    secondBestSim = sim;
                }
            }

            boolean passesThreshold = bestSim >= SIMILARITY_THRESHOLD;

            boolean isUniqueMatch = (assetEmbeddings.size() <= 1)
                    || ((bestSim - secondBestSim) >= UNIQUENESS_MARGIN);

            if (passesThreshold && isUniqueMatch) {
                matchedEvents.add(new EventMatch(
                        event.id(),
                        event.title(),
                        bestSim,
                        secondBestSim,
                        bestAssetIndex,
                        i
                ));

                log.info("MATCH ✅ event='{}' bestSim={} secondBestSim={} margin={} matchedAssetIndex={}",
                        event.title(), bestSim, secondBestSim, (bestSim - secondBestSim), bestAssetIndex);
            } else {
                log.info("NO MATCH ❌ event='{}' bestSim={} secondBestSim={} margin={}",
                        event.title(), bestSim, secondBestSim, (bestSim - secondBestSim));
            }
        }

        log.info("Total matched events above threshold ({}), uniqueness margin ({}): {}",
                SIMILARITY_THRESHOLD, UNIQUENESS_MARGIN, matchedEvents.size());

        // Sort by strongest similarity first
        matchedEvents.sort((a, b) -> Double.compare(b.bestSimilarity(), a.bestSimilarity()));

        // Return events ordered by match strength
        return matchedEvents.stream()
                .map(match -> events.get(match.eventIndex()))
                .filter(event -> {
                    String titleLower = event.title().toLowerCase();
                    return !(titleLower.contains(" vs ") || titleLower.contains(" vs. "));
                })
                .toList();
    }

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

    public record EventMatch(
            String eventId,
            String eventTitle,
            double bestSimilarity,
            double secondBestSimilarity,
            int matchedAssetIndex,
            int eventIndex
    ) {}
}
