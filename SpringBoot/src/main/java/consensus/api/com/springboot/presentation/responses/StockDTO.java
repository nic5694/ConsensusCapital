package consensus.api.com.springboot.presentation.responses;

public record StockDTO(String symbol, String name, String fullExchangeName, Double price) {}
