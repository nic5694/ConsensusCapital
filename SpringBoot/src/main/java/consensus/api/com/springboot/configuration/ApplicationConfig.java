package consensus.api.com.springboot.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig implements WebMvcConfigurer {

    private final ApplicationProperties applicationProps;

    @Override
    public void addCorsMappings(final CorsRegistry registry) {
        log.debug("Configuring CORS with allowed origin: {}", applicationProps.getClientOriginUrl());
        registry.addMapping("/**")
                .allowedOrigins(applicationProps.getClientOriginUrl())
                .allowedHeaders(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE)
                .allowedMethods(HttpMethod.GET.name())
                .maxAge(86400);
    }
}
