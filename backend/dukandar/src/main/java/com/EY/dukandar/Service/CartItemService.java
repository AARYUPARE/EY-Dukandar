package com.EY.dukandar.Service;

import com.EY.dukandar.Model.CartItem;

import java.util.List;

public interface CartItemService {

    // Add item to cart with size + quantity
    CartItem addItem(Long cartId, Long productId, String size, int quantity);

    // Get all items for a cart
    List<CartItem> getItems(Long cartId);

    // Remove one item
    void removeItem(Long itemId);

    // Clear entire cart
    void clearCart(Long cartId);
}