package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Model.Wishlist;

import java.util.List;
import java.util.Map;

public interface WishlistService {

    Wishlist addToWishlist(Long userId, Long productId, String size);

    List<Wishlist> getUserWishlist(Long userId);

    List<Wishlist> getAvailableWishlistInStore(Long userId, Long storeId);

    void removeFromWishlist(Long userId, Long productId, String size);
}