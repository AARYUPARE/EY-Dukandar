package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryServiceImplementation implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Override
    public Inventory addInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    @Override
    public Inventory getInventoryById(Long id) {
        Optional<Inventory> invOpt = inventoryRepository.findById(id);
        return invOpt.orElse(null);
    }

    @Override
    public List<Inventory> getInventoryForProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    @Override
    public List<Inventory> getInventoryForStore(Long storeId) {
        return inventoryRepository.findByStoreId(storeId);
    }

    @Override
    public Inventory updateStock(Long storeId, Long productId, int newStock) {
        Optional<Inventory> invOpt = Optional.ofNullable(inventoryRepository.findByStoreIdAndProductId(storeId, productId));
        if (invOpt.isPresent()) {
            Inventory inventory = invOpt.get();
            inventory.setStockQuantity(newStock);
            inventory.setAvailable(newStock > 0);
            return inventoryRepository.save(inventory);
        }
        return null;
    }

    @Override
    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }
}

