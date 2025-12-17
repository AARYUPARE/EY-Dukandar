package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Wishlist;
import com.EY.dukandar.Service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/add")
    public Wishlist addWishlist(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam String size) {

        return wishlistService.addToWishlist(userId, productId, size);
    }

    // 1️⃣ See wishlist with availability
    @GetMapping("/{userId}")
    public List<Wishlist> getWishlist(@PathVariable Long userId) {
        return wishlistService.getUserWishlist(userId);
    }

    // 2️⃣ Get available wishlist items for particular store
    @GetMapping("/{userId}/store/{storeId}")
    public List<Wishlist> getAvailableWishlist(
            @PathVariable Long userId,
            @PathVariable Long storeId) {

        return wishlistService.getAvailableWishlistInStore(userId, storeId);
    }

    @DeleteMapping("/remove")
    public String removeWishlist(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam String size) {

        wishlistService.removeFromWishlist(userId, productId, size);
        return "Removed from wishlist";
    }
}