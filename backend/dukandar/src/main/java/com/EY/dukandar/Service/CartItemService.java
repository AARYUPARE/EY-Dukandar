package com.EY.dukandar.Service;

import com.EY.dukandar.Model.CartItem;

import java.util.List;

public interface CartItemService {
    CartItem addItem(Long cartId, Long productId, int quantity);
    List<CartItem> getItems(Long cartId);
    void removeItem(Long itemId);
}

