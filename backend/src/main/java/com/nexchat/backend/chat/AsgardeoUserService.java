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

        // Diagnostics helper: returns true if we can fetch an access token
        public boolean canFetchToken() {
            try {
                String token = fetchAccessToken();
                return token != null && !token.isBlank();
            } catch (Exception e) {
                logger.error("Diagnostics: token fetch failed", e);
                return false;
            }
        }

        public List<UserSummary> listUsers() {
            String accessToken = fetchAccessToken();
            if (accessToken == null) {
                logger.error("No Asgardeo access token available, cannot list users");
                return List.of();
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            int startIndex = 1;
            int count = 100; // page size
            int totalResults = Integer.MAX_VALUE;
            List<UserSummary> all = new java.util.ArrayList<>();

            try {
                while (all.size() < totalResults) {
                    String url = asgardeoBaseUrl + "/scim2/Users?startIndex=" + startIndex + "&count=" + count;
                    ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        new ParameterizedTypeReference<Map<String, Object>>() {}
                    );
                    Map<String, Object> body = response.getBody();
                    if (body == null) {
                        logger.error("User list response body is null at startIndex {}", startIndex);
                        break;
                    }
                    Object total = body.get("totalResults");
                    if (total instanceof Number n) {
                        totalResults = n.intValue();
                    }
                    Object resourcesObj = body.get("Resources");
                    if (!(resourcesObj instanceof List<?> resources)) {
                        logger.error("SCIM Users response missing Resources array at startIndex {}", startIndex);
                        break;
                    }
                    int addedThisPage = 0;
                    for (Object item : resources) {
                        if (item instanceof Map<?, ?> m) {
                            String userName = m.get("userName") != null ? m.get("userName").toString() : null;
                            String givenName = null;
                            String familyName = null;
                            String displayName = null;
                            Object nameObj = m.get("name");
                            if (nameObj instanceof Map<?,?> nm) {
                                Object g = nm.get("givenName");
                                Object f = nm.get("familyName");
                                if (g != null) givenName = g.toString();
                                if (f != null) familyName = f.toString();
                            }
                            Object displayObj = m.get("displayName");
                            if (displayObj != null) displayName = displayObj.toString();
                            if (userName != null) {
                                all.add(new UserSummary(userName, givenName, familyName, displayName));
                                addedThisPage++;
                            }
                        }
                    }
                    if (addedThisPage == 0) break; // no more pages
                    startIndex += count;
                }
            } catch (Exception e) {
                logger.error("Exception while listing Asgardeo users via SCIM", e);
            }

            return all;
        }

    // You can add create, view, delete, update methods similarly
}
