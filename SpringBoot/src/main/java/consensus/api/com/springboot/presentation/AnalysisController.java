package consensus.api.com.springboot.presentation;


import consensus.api.com.springboot.buisness.AnalysisService;
import consensus.api.com.springboot.buisness.PortfolioService;
import consensus.api.com.springboot.presentation.request.AssetRequest;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/analysis")
@CrossOrigin(origins = {"http://localhost:3000", "https://mchacks.benmusicgeek.synology.me"})
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/summary")
    public void getMarketSummary() {
        String userId = "test-user";
        analysisService.analyzeData(userId);
    }

}
