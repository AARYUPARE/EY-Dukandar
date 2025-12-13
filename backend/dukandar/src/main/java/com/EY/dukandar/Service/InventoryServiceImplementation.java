package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InventoryServiceImplementation implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Override
    public Inventory addInventory(Inventory inventory) {
        inventory.setAvailable(inventory.getStockQuantity() > 0);
        return inventoryRepository.save(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inventory> getInventoryForProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inventory> getInventoryForStore(Long storeId) {
        return inventoryRepository.findByStoreId(storeId);
    }

    @Override
    public Inventory updateStock(Long storeId, Long productId, int newStock) {
        Inventory inv = inventoryRepository.findByStoreIdAndProductId(storeId, productId);
        if (inv != null) {
            inv.setStockQuantity(newStock);
            inv.setAvailable(newStock > 0);
            return inventoryRepository.save(inv);
        }
        return null;
    }

    /** BUY OR RESERVE → Reduce stock atomically */
    @Override
    public Inventory reduceStock(Long storeId, Long productId, int qty) {
        if (qty <= 0) return null;

        int updated = inventoryRepository.reduceStockAtomic(storeId, productId, qty);
        if (updated <= 0) {
            // Either inventory not found or insufficient stock
            return null;
        }

        // fetch and return updated inventory
        Inventory inv = inventoryRepository.findByStoreIdAndProductId(storeId, productId);
        if (inv != null) {
            inv.setAvailable(inv.getStockQuantity() > 0);
            return inv;
        }
        return null;
    }

    /** Add stock (e.g., new shipment) */
    @Override
    public Inventory increaseStock(Long storeId, Long productId, int qty) {
        if (qty <= 0) return null;

        int updated = inventoryRepository.increaseStockAtomic(storeId, productId, qty);
        if (updated <= 0) {
            // inventory row might not exist — try to create one
            Inventory inv = inventoryRepository.findByStoreIdAndProductId(storeId, productId);
            if (inv == null) {
                // create new inventory row
                Inventory newInv = new Inventory();
                newInv.setProductId(productId);
                newInv.setStoreId(storeId);
                newInv.setStockQuantity(qty);
                newInv.setAvailable(qty > 0);
                return inventoryRepository.save(newInv);
            } else {
                // should not normally happen, but return current
                inv.setAvailable(inv.getStockQuantity() > 0);
                return inventoryRepository.save(inv);
            }
        }

        // fetch and return updated inventory
        Inventory inv = inventoryRepository.findByStoreIdAndProductId(storeId, productId);
        if (inv != null) {
            inv.setAvailable(inv.getStockQuantity() > 0);
            return inv;
        }
        return null;
    }

    /** TEMPORARY HOLD / RESERVATION (same logic as reduceStock) */
    @Override
    public Inventory reserveStock(Long storeId, Long productId, int qty) {
        return reduceStock(storeId, productId, qty);
    }

    @Override
    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }
}
