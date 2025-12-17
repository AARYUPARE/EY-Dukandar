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

@Service
public class CartItemServiceImplementation implements CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;


    // ⭐ Add item to cart with size + quantity
    @Override
    public CartItem addItem(Long cartId, Long productId, String size, int quantity) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setSize(size);
        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }


    // ⭐ Get all items of cart
    @Override
    public List<CartItem> getItems(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }


    // ⭐ Remove one item
    @Override
    public void removeItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }


    // ⭐ Clear full cart (used after successful order placement)
    @Override
    public void clearCart(Long cartId) {
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        cartItemRepository.deleteAll(items);
    }
}