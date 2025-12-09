package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.CartItem;
import com.EY.dukandar.Service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-item")
public class CartItemController {

    @Autowired
    private CartItemService itemService;

    @PostMapping("/add")
    public CartItem addItem(@RequestParam Long cartId,
                            @RequestParam Long productId,
                            @RequestParam int quantity) {
        return itemService.addItem(cartId, productId, quantity);
    }

    @GetMapping("/{cartId}")
    public List<CartItem> getItems(@PathVariable Long cartId) {
        return itemService.getItems(cartId);
    }

    @DeleteMapping("/{itemId}")
    public String removeItem(@PathVariable Long itemId) {
        itemService.removeItem(itemId);
        return "Item removed";
    }
}

