package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Model.Product;

import java.util.List;
import java.util.Map;

public interface InventoryService {

    Inventory addInventory(Inventory inventory);

    Inventory getInventoryById(Long id);

    List<Inventory> getInventoryForProduct(Long productId);

    List<Inventory> getInventoryForStore(Long storeId);

    Inventory updateStock(Long storeId, Long productId, int newStock, String size);

    void deleteInventory(Long id);

    void reduceStock(Long storeId, Long productId, String size, int qty);

    List<Inventory> checkInventory(Long productId, Long storeId, String size);

    List<Inventory> getAvailableProductsInStore(Long storeId);

    public List<Map<String, Object>> findNearbyStoresForProduct(
            Long productId,
            String city,
            double maxDistanceKm
    );
}