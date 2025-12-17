package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/available")
    public List<Inventory> getAvailableProducts(@RequestParam Long storeId) {
        return inventoryService.getAvailableProductsInStore(storeId);
    }

    @GetMapping("/check")
    public List<Inventory> checkInventory(
            @RequestParam Long productId,
            @RequestParam Long storeId,
            @RequestParam String size) {

        return inventoryService.checkInventory(productId, storeId, size);
    }

    @PutMapping("/{storeId}/{productId}")
    public Inventory updateStock(@PathVariable Long storeId,
                                 @PathVariable Long productId,
                                 @RequestParam int newStock,
                                 @RequestParam String size) {

        return inventoryService.updateStock(storeId, productId, newStock, size);
    }

    @PostMapping("/{storeId}/{productId}/reduce")
    public void reduceStock(@PathVariable Long storeId,
                            @PathVariable Long productId,
                            @RequestParam String size,
                            @RequestParam int qty) {

        inventoryService.reduceStock(storeId, productId, size, qty);

    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return "Inventory deleted.";
    }

    @GetMapping("/product/{productId}/nearby")
    public List<Map<String, Object>> getNearbyStoresForProduct(
            @PathVariable Long productId,
            @RequestParam String city,
            @RequestParam(defaultValue = "15") double maxDistanceKm
    ) {
        return inventoryService.findNearbyStoresForProduct(
                productId,
                city,
                maxDistanceKm
        );
    }
}