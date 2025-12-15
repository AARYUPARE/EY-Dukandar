package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;

import java.util.List;
import java.util.Map;

public interface InventoryService {

    Inventory addInventory(Inventory inventory);

    Inventory getInventoryById(Long id);

    List<Inventory> getInventoryForProduct(Long productId);

    List<Inventory> getInventoryForStore(Long storeId);

    Inventory updateStock(Long storeId, Long productId, int newStock);

    void deleteInventory(Long id);

    Inventory reduceStock(Long storeId, Long productId, int qty);

    Inventory increaseStock(Long storeId, Long productId, int qty);

    Inventory reserveStock(Long storeId, Long productId, int qty);

    List<Inventory> checkInventory(Long productId, String size);

    public List<Map<String, Object>> findNearbyStoresForProduct(
            Long productId,
            String city,
            double maxDistanceKm
    );
}
