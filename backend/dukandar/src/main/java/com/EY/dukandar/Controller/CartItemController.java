package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.CartItem;
import com.EY.dukandar.Service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    /**
     * Add item to cart (with productId, size, quantity)
     */
    @PostMapping("/add")
    public CartItem addItem(
            @RequestParam Long cartId,
            @RequestParam Long productId,
            @RequestParam String size,
            @RequestParam int quantity
    ) {
        return cartItemService.addItem(cartId, productId, size, quantity);
    }

    /**
     * Get all items of a cart
     */
    @GetMapping("/{cartId}")
    public List<CartItem> getItems(@PathVariable Long cartId) {
        return cartItemService.getItems(cartId);
    }

    /**
     * Remove a single cart item
     */
    @DeleteMapping("/{itemId}")
    public String removeItem(@PathVariable Long itemId) {
        cartItemService.removeItem(itemId);
        return "Item removed successfully!";
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping("/clear/{cartId}")
    public String clearCart(@PathVariable Long cartId) {
        cartItemService.clearCart(cartId);
        return "Cart cleared successfully!";
    }
}