package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AsgardeoUserService {

    private static final Logger logger = LoggerFactory.getLogger(AsgardeoUserService.class);

    @Value("${asgardeo.api.base-url}")
    private String asgardeoBaseUrl;

        @Value("${asgardeo.m2m.client-id}")
        private String m2mClientId;

        @Value("${asgardeo.m2m.client-secret}")
        private String m2mClientSecret;

        @Value("${asgardeo.m2m.token-url}")
        private String m2mTokenUrl;

        @Value("${asgardeo.m2m.scope}")
        private String m2mScope;

    private final RestTemplate restTemplate = new RestTemplate();

        private String fetchAccessToken() {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "client_credentials");
            params.add("client_id", m2mClientId);
            params.add("client_secret", m2mClientSecret);
            params.add("scope", m2mScope);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

                try {
                    ResponseEntity<Map> response = restTemplate.postForEntity(
                        m2mTokenUrl,
                        entity,
                        Map.class
                    );
                    Map<String, Object> body = response.getBody();
                    if (body == null || !body.containsKey("access_token")) {
                        logger.error("Failed to fetch Asgardeo access token: response body is null or missing access_token");
                        return null;
                    }
                    return body.get("access_token").toString();
                } catch (Exception e) {
                    logger.error("Exception while fetching Asgardeo access token", e);
                    return null;
                }
        }

        public List<String> listUsers() {
                String accessToken = fetchAccessToken();
                if (accessToken == null) {
                    logger.error("No Asgardeo access token available, cannot list users");
                    return List.of();
                }
                String url = asgardeoBaseUrl + "/internal_user_mgt_list";
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(accessToken);
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                try {
                    ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                    );
                    List<Map<String, Object>> users = response.getBody();
                    if (users == null) {
                        logger.error("User list response body is null");
                        return List.of();
                    }
                    return users.stream().map(u -> u.get("username").toString()).toList();
                } catch (Exception e) {
                    logger.error("Exception while listing Asgardeo users", e);
                    return List.of();
                }
        }

    // You can add create, view, delete, update methods similarly
}
