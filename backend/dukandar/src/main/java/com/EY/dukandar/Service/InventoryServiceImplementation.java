package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Inventory;
import com.EY.dukandar.Model.Store;
import com.EY.dukandar.Repository.InventoryRepository;
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

    // 🔥 NEW (required for nearby-store lookup)
    @Autowired
    private StoreRepository storeRepository;

    // ================= EXISTING METHODS (UNCHANGED) =================

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

    public List<Inventory> checkInventory(Long productId, String size) {
        if (size == null || size.isEmpty()) {
            return inventoryRepository.findByProductId(productId);
        }
        return inventoryRepository.findByProductIdAndSize(productId, size);
    }

    @Override
    public Inventory reduceStock(Long storeId, Long productId, String size, int qty) {
        if (qty <= 0) return null;

        int updated = inventoryRepository.reduceStock(storeId, productId, size, qty);
        if (updated <= 0) {
            return null;
        }

        Inventory inv = inventoryRepository.findByStoreIdAndProductId(storeId, productId);
        if (inv != null) {
            inv.setAvailable(inv.getStockQuantity() > 0);
            return inv;
        }
        return null;
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
            double maxDistanceKm
    ) {

        double[] userCoords = CoordinateResolver.resolve(city);
        if (userCoords == null) {
            return Collections.emptyList();
        }

        double userLat = userCoords[0];
        double userLon = userCoords[1];

        List<Inventory> inventoryList =
                inventoryRepository.findByProductId(productId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Inventory inv : inventoryList) {

            if (!inv.isAvailable() || inv.getStockQuantity() <= 0) {
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
