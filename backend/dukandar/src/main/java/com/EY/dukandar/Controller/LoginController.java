package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.*;
import com.EY.dukandar.Repository.StoreRepository;
import com.EY.dukandar.Repository.UserRepository;
import com.EY.dukandar.Service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.EY.dukandar.LangChain.LangChainClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired LangChainClient langChainClient;

    @PostMapping
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null || !user.getPassword().equals(request.getPassword())) {

            return new LoginResponse(
                    "login failed",
                    null,
                    "",
                    null,
                    null,
                    ""
            );
        }

        user.setPassword(null);

        // WEB LOGIN
        if ("web".equalsIgnoreCase(request.getStoreType())) {

            Map<String, Object> agentResponse =
                    langChainClient.sendLoginEvent(
                            user.getId().toString(),
                            "web",
                            user,
                            null
                    );

            return new LoginResponse(
                    "login successful",
                    user,
                    "web",
                    null,
                    null,
                    agentResponse.get("reply").toString()
            );
        }

        // KIOSK LOGIN
        if ("kiosk".equalsIgnoreCase(request.getStoreType())) {

            if (request.getStoreId() == null) {
                throw new RuntimeException("storeId is required for kiosk login");
            }

            List<Wishlist> availableWishlist =
                    wishlistService.getAvailableWishlistInStore(user.getId(), request.getStoreId());

            Store store = storeRepository.findByStoreId(request.getStoreId());

            Map<String, Object> agentResponse =
                    langChainClient.sendLoginEvent(
                            user.getId().toString(),
                            "kiosk",
                            user,
                            store
                    );

            return new LoginResponse(
                    "login successful",
                    user,
                    "kiosk",
                    store,
                    availableWishlist,
                    agentResponse.get("reply").toString()
            );
        }

        else {
            return new LoginResponse(
                    "login failed",
                    null,
                    "",
                    null,
                    null,
                    ""
            );
        }
    }
}