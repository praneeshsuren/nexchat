package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class AsgardeoDiagnosticsController {

    @Autowired
    private AsgardeoUserService asgardeoUserService;

    @GetMapping("/api/asgardeo/diagnostics")
    public Map<String, Object> diagnostics() {
        Map<String, Object> result = new HashMap<>();
        boolean tokenOk = asgardeoUserService.canFetchToken();
        result.put("tokenOk", tokenOk);
        try {
            List<UserSummary> users = asgardeoUserService.listUsers();
            result.put("usersCount", users.size());
            // include a small sample of names for visibility
            result.put("sample", users.stream()
                    .limit(3)
                    .map(u -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("userName", u.getUserName());
                        m.put("givenName", u.getGivenName());
                        m.put("familyName", u.getFamilyName());
                        return m;
                    })
                    .toArray());
        } catch (Exception e) {
            result.put("usersCount", 0);
            result.put("error", e.getMessage());
        }
        return result;
    }
}
