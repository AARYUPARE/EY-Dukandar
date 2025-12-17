package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.LoginRequest;
import com.EY.dukandar.Model.LoginResponse;
import com.EY.dukandar.Model.User;
import com.EY.dukandar.Model.Wishlist;
import com.EY.dukandar.Repository.UserRepository;
import com.EY.dukandar.Service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null || !user.getPassword().equals(request.getPassword())) {

            return new LoginResponse(
                    "login failed",
                    null,
                    "",
                    request.getStoreId(),
                    null
            );
        }

        user.setPassword(null);

        // WEB LOGIN
        if ("web".equalsIgnoreCase(request.getStoreType())) {
            return new LoginResponse(
                    "login successful",
                    user,
                    "web",
                    null,
                    null
            );
        }

        // KIOSK LOGIN
        if ("kiosk".equalsIgnoreCase(request.getStoreType())) {

            if (request.getStoreId() == null) {
                throw new RuntimeException("storeId is required for kiosk login");
            }

            List<Wishlist> availableWishlist =
                    wishlistService.getAvailableWishlistInStore(user.getId(), request.getStoreId());

            return new LoginResponse(
                    "login successful",
                    user,
                    "kiosk",
                    request.getStoreId(),
                    availableWishlist
            );
        }

        else {
            return new LoginResponse(
                    "login failed",
                    null,
                    "",
                    request.getStoreId(),
                    null
            );
        }
    }
}