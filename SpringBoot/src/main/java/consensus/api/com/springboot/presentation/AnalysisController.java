package consensus.api.com.springboot.presentation;


import consensus.api.com.springboot.buisness.AnalysisService;
import consensus.api.com.springboot.buisness.DTO.PolyMarketInfoDTO;
import consensus.api.com.springboot.buisness.PortfolioService;
import consensus.api.com.springboot.presentation.request.AssetRequest;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/analysis")
@CrossOrigin(origins = {"http://localhost:8090", "https://mchacks.benmusicgeek.synology.me"})
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/summary")
    @Cacheable(cacheNames = "analysisSummary", key = "#user.getSubject()")
    public List<PolyMarketInfoDTO> getMarketSummary(@AuthenticationPrincipal Jwt user) {
        String userId = user.getSubject();
        return analysisService.analyzeData(userId);
    }

}
