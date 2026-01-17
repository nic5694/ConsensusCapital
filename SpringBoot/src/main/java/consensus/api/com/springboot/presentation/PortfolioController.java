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
@CrossOrigin(origins = "http://localhost:3000")
public class PortfolioController {
    private final PortfolioService portfolioService;

    @PostMapping()
    public void createPortfolio(@AuthenticationPrincipal Jwt user) {
        String userId = user.getSubject();
        portfolioService.createPortfolio(userId);
    }

    @GetMapping
    public PortfolioResponse fetchPortfolio(@AuthenticationPrincipal Jwt user) {
        String userId = user.getSubject();
        return portfolioService.fetchPortfolio(userId);
    }

    @PutMapping("/assets")
    public void addAssetToPortfolio(@RequestBody AssetRequest assetRequest,
                                    @AuthenticationPrincipal Jwt user) {
        String userId = user.getSubject();
        portfolioService.addAssetToPortfolio(userId, assetRequest);
    }
}
