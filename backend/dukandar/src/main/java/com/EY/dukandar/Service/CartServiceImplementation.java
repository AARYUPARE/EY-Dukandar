package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Cart;
import com.EY.dukandar.Model.User;
import com.EY.dukandar.Repository.CartRepository;
import com.EY.dukandar.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartServiceImplementation implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Cart getCartByUser(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        return cart != null ? cart : null;
    }

    @Override
    public Cart createCart(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return null; // Or throw exception
        }

        User user = userOpt.get();
        Cart cart = new Cart();
        cart.setUser(user);

        return cartRepository.save(cart);
    }
}