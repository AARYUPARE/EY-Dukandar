package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping
    public Inventory add(@RequestBody Inventory inventory) {
        return inventoryService.addInventory(inventory);
    }

    @GetMapping("/{id}")
    public Inventory getById(@PathVariable Long id) {
        return inventoryService.getInventoryById(id);
    }

    @GetMapping("/product/{productId}")
    public List<Inventory> getByProduct(@PathVariable Long productId) {
        return inventoryService.getInventoryForProduct(productId);
    }

    @GetMapping("/store/{storeId}")
    public List<Inventory> getByStore(@PathVariable Long storeId) {
        return inventoryService.getInventoryForStore(storeId);
    }

    @PutMapping("/{storeId}/{productId}")
    public Inventory updateStock(@PathVariable Long storeId,
                                 @PathVariable Long productId,
                                 @RequestParam int stock) {
        return inventoryService.updateStock(storeId, productId, stock);
    }

    @PostMapping("/{storeId}/{productId}/reduce")
    public Inventory reduceStock(@PathVariable Long storeId,
                                 @PathVariable Long productId,
                                 @RequestParam int qty) {
        Inventory inv = inventoryService.reduceStock(storeId, productId, qty);
        if (inv == null) {
            throw new RuntimeException("Insufficient stock or inventory not found");
        }
        return inv;
    }

    @PostMapping("/{storeId}/{productId}/reserve")
    public Inventory reserveStock(@PathVariable Long storeId,
                                  @PathVariable Long productId,
                                  @RequestParam int qty) {
        Inventory inv = inventoryService.reserveStock(storeId, productId, qty);
        if (inv == null) {
            throw new RuntimeException("Insufficient stock or inventory not found");
        }
        return inv;
    }

    @PostMapping("/{storeId}/{productId}/add")
    public Inventory addStock(@PathVariable Long storeId,
                              @PathVariable Long productId,
                              @RequestParam int qty) {
        Inventory inv = inventoryService.increaseStock(storeId, productId, qty);
        if (inv == null) {
            throw new RuntimeException("Failed to add stock");
        }
        return inv;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return "Inventory deleted.";
    }
}
