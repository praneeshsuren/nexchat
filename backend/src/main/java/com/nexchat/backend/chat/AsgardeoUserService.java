package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class AsgardeoUserService {

    @Value("${asgardeo.api.base-url}")
    private String asgardeoBaseUrl;

    @Value("${asgardeo.api.token}")
    private String asgardeoToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> listUsers() {
        String url = asgardeoBaseUrl + "/internal_user_mgt_list";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(asgardeoToken);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );
        List<Map<String, Object>> users = response.getBody();
        // Extract usernames or IDs from the response as needed
        return users != null ? users.stream().map(u -> u.get("username").toString()).toList() : List.of();
    }

    // You can add create, view, delete, update methods similarly
}
