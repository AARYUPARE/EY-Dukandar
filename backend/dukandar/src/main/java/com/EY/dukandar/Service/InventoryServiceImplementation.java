package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Model.Store;
import com.EY.dukandar.Repository.InventoryRepository;
import com.EY.dukandar.Repository.ProductRepository;
import com.EY.dukandar.Repository.StoreRepository;
import com.EY.dukandar.Util.CoordinateResolver;
import com.EY.dukandar.Util.DistanceCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class InventoryServiceImplementation implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    // 🔥 NEW (required for nearby-store lookup)
    @Autowired
    private StoreRepository storeRepository;

    // ================= EXISTING METHODS (UNCHANGED) =================

    @Override
    public Inventory addInventory(Inventory inventory)
    {
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
    public List<Inventory> getAvailableProductsInStore(Long storeId) {
        return inventoryRepository.findAllAvailableInStore(storeId);
    }

    @Override
    public Inventory updateStock(Long storeId, Long productId, int newStock, String size) {

        Inventory inv = inventoryRepository
                .findByProductIdAndSizeAndStoreId(productId, size, storeId);

        if (inv != null) {

            int updatedStock = inv.getStockQuantity() + newStock;
            inv.setStockQuantity(updatedStock);
            inv.setAvailable(updatedStock > 0);
            return inventoryRepository.save(inv);
        }

        else {
            Inventory newInv = new Inventory();
            newInv.setProductId(productId);
            newInv.setStoreId(storeId);
            newInv.setSize(size);
            newInv.setStockQuantity(newStock);
            newInv.setAvailable(newStock > 0);
            return inventoryRepository.save(newInv);
        }
    }

    @Override
    public List<Inventory> checkInventory(Long productId, Long storeId, String size) {

        return inventoryRepository.checkAvailable(productId, storeId, size);
    }

    @Override
    public void reduceStock(Long storeId, Long productId, String size, int qty) {

        // 1️⃣ Find inventory first
        Inventory inventory = inventoryRepository
                .findByProductIdAndSizeAndStoreId(productId, size, storeId);

        if (inventory == null) {
            throw new RuntimeException("Inventory not found");
        }

        // 2️⃣ Check stock
        if (inventory.getStockQuantity() < qty) {
            throw new RuntimeException("Insufficient stock");
        }

        // 3️⃣ Reduce stock using JPQL atomic update
        int updatedRows = inventoryRepository.reduceStock(
                storeId, productId, size, qty);

        if (updatedRows == 0) {
            throw new RuntimeException("Stock update failed");
        }
    }


    @Override
    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }

    // ================= 🔥 NEW METHOD ONLY =================

    /**
     * Finds nearby stores for a product based on user city and distance
     * Used by AI endpoint:
     * /api/inventory/product/{productId}/nearby
     */
    public List<Map<String, Object>> findNearbyStoresForProduct(
            Long productId,
            String city,
            String size,
            double maxDistanceKm
    ) {

        double[] userCoords = CoordinateResolver.resolve(city);
        if (userCoords == null) {
            return Collections.emptyList();
        }

        double userLat = userCoords[0];
        double userLon = userCoords[1];

        List<Inventory> inventoryList =
                inventoryRepository.findByProductIdAndSize(productId, size);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Inventory inv : inventoryList) {

            if (inv.getStockQuantity() <= 0) {
                continue;
            }

            Store store =
                    storeRepository.findById(inv.getStoreId()).orElse(null);

            if (store == null ||
                    store.getLatitude() == null ||
                    store.getLongitude() == null) {
                continue;
            }

            double distance = DistanceCalculator.calculate(
                    userLat,
                    userLon,
                    store.getLatitude(),
                    store.getLongitude()
            );

            if (distance > maxDistanceKm) {
                continue;
            }

            Map<String, Object> storeData = new HashMap<>();
            storeData.put("id", store.getId());
            storeData.put("name", store.getName());
            storeData.put("address", store.getAddress());
            storeData.put("distanceKm", Math.round(distance * 10.0) / 10.0);
            storeData.put("stockQuantity", inv.getStockQuantity());
            storeData.put("size", inv.getSize());
            storeData.put("imageUrl", store.getImageUrl());
            storeData.put("phone", store.getPhone());

            result.add(storeData);
        }

        result.sort(
                Comparator.comparingDouble(
                        s -> (double) s.get("distanceKm")
                )
        );

        System.out.println(result);

        return result;
    }
}