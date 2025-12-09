package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;

import java.util.List;

public interface InventoryService {

    Inventory addInventory(Inventory inventory);

    Inventory getInventoryById(Long id);

    List<Inventory> getInventoryForProduct(Long productId);

    List<Inventory> getInventoryForStore(Long storeId);

    Inventory updateStock(Long storeId, Long productId, int newStock);

    void deleteInventory(Long id);
}

