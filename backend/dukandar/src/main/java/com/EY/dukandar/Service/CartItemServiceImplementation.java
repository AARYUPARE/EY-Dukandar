package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Cart;
import com.EY.dukandar.Model.CartItem;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Repository.CartItemRepository;
import com.EY.dukandar.Repository.CartRepository;
import com.EY.dukandar.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemServiceImplementation implements CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;


    @Override
    public CartItem addItem(Long cartId, Long productId, int quantity) {
        Optional<Cart> cartOpt = cartRepository.findById(cartId);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (cartOpt.isEmpty() || productOpt.isEmpty()) {
            return null; // Or throw exception if preferred
        }

        CartItem cartItem = new CartItem();
        cartItem.setCart(cartOpt.get());
        cartItem.setProduct(productOpt.get());
        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public List<CartItem> getItems(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    @Override
    public void removeItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }
}
