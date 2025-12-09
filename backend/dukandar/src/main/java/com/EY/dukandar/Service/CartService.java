package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Cart;

public interface CartService {
    Cart getCartByUser(Long userId);
    Cart createCart(Long userId);
}

