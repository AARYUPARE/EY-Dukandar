package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Model.Wishlist;
import com.EY.dukandar.Repository.InventoryRepository;
import com.EY.dukandar.Repository.ProductRepository;
import com.EY.dukandar.Repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WishlistServiceImplementation implements WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Override
    public Wishlist addToWishlist(Long userId, Long productId, String size) {

        Optional<Wishlist> exists =
                wishlistRepository.findByUserIdAndProduct_IdAndSize(userId, productId, size);

        if (exists.isPresent()) {
            throw new RuntimeException("Already added to wishlist");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Wishlist wishlist = new Wishlist(userId, product, size);

        return wishlistRepository.save(wishlist);
    }

    // =============================================================
    // 1️⃣ SHOW ALL WISHLIST ITEMS — MARK AVAILABLE/OUT OF STOCK
    // Returns wishlist items with availability across ANY store
    // =============================================================
    @Override
    public List<Wishlist> getUserWishlist(Long userId) {

        return wishlistRepository.findByUserId(userId);

    }

    // =============================================================
    // 2️⃣ SHOW AVAILABLE ITEMS IN A SPECIFIC STORE (storeId)
    // Returns wishlist items available IN THAT store only
    // =============================================================
    @Override
    public List<Wishlist> getAvailableWishlistInStore(Long userId, Long storeId) {

        List<Wishlist> items = wishlistRepository.findByUserId(userId);
        List<Wishlist> available = new ArrayList<>();

        for (Wishlist w : items) {

            List<Inventory> invList = inventoryRepository.checkAvailable(
                    w.getProduct().getId(),
                    storeId,
                    w.getSize()
            );

            // If at least one inventory entry exists → product is available
            if (!invList.isEmpty()) {
                available.add(w);   // return the actual Wishlist object
            }
        }

        return available;
    }

    @Override
    public void removeFromWishlist(Long userId, Long productId, String size) {
        wishlistRepository.deleteByUserIdAndProduct_IdAndSize(userId, productId, size);
    }
}