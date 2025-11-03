package com.nexchat.backend.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.Nullable;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Autowired
    private JwtDecoder jwtDecoder;

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
            .setAllowedOriginPatterns("*")
            .addInterceptors(new HandshakeInterceptor() {
                @Override
                public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                              @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {
                    // Only require Authorization for actual WebSocket handshake, not SockJS info/XHR
                    String upgradeHeader = request.getHeaders().getFirst("Upgrade");
                    if (upgradeHeader != null && upgradeHeader.equalsIgnoreCase("websocket")) {
                        String authHeader = request.getHeaders().getFirst("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            try {
                                var jwt = jwtDecoder.decode(authHeader.substring(7));
                                attributes.put("username", jwt.getClaimAsString("sub"));
                                return true;
                            } catch (Exception e) {
                                return false;
                            }
                        }
                        return false;
                    }
                    // Allow SockJS fallback requests (like /info) without auth
                    return true;
                }
                @Override
                public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                          @NonNull WebSocketHandler wsHandler, @Nullable Exception ex) {
                    // No-op
                }
            })
            .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
    registry.setApplicationDestinationPrefixes("/app");
    registry.enableSimpleBroker("/queue", "/channel", "/dm"); // include /dm for direct messaging without Principal
    registry.setUserDestinationPrefix("/user");
    }
}
