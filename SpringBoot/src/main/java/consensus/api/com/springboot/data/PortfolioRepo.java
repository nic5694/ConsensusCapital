package consensus.api.com.springboot.data;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface PortfolioRepo extends MongoRepository<Portfolio, String> {
    Portfolio findByUserId(String userId);
}
