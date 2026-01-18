package consensus.api.com.springboot.presentation;


import consensus.api.com.springboot.buisness.PortfolioService;
import consensus.api.com.springboot.presentation.request.AssetRequest;
import consensus.api.com.springboot.presentation.responses.PortfolioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/portfolios")
@CrossOrigin(origins = {"http://localhost:8090", "https://mchacks.benmusicgeek.synology.me"})
public class PortfolioController {
    private final PortfolioService portfolioService;

    @PostMapping()
    public void createPortfolio() {
        String userId = "test-user";
        portfolioService.createPortfolio(userId);
    }

    @GetMapping
    public PortfolioResponse fetchPortfolio() {
        String userId = "test-user";
        return portfolioService.fetchPortfolio(userId);
    }

    @PostMapping("/assets")
    public void addAssetToPortfolio(@RequestBody AssetRequest assetRequest) {
        String userId = "test-user";
        portfolioService.addAssetToPortfolio(userId, assetRequest);
    }

    @DeleteMapping("/assets/{assetSymbol}" )
    public void removeAssetFromPortfolio(@PathVariable String assetSymbol) {
        String userId = "test-user";
        portfolioService.removeAssetFromPortfolio(userId, assetSymbol);
    }
}
