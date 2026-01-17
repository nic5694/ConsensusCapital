package consensus.api.com.springboot.presentation;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class profile {

    @GetMapping("/public")
    public String getPublicProfile() {
        return "This is a public profile.";
    }

    @GetMapping("/private")
    public String getPrivateProfile() {
        return "This is a private profile.";
    }
}
