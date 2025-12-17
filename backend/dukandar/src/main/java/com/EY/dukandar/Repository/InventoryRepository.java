package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByProductId(Long productId);

    List<Inventory> findByStoreId(Long storeId);

    Inventory findByStoreIdAndProductId(Long storeId, Long productId);

    List<Inventory> findByProductIdAndSize(Long productId, String size);

    List<Inventory> findByStoreIdAndSize(Long storeId, String size);

    Inventory findByProductIdAndSizeAndStoreId(
            Long productId,
            String size,
            Long storeId
    );

    @Modifying
    @Query("""
    UPDATE Inventory i
    SET i.stockQuantity = i.stockQuantity - :orderedQty
    WHERE i.storeId = :storeId
      AND i.productId = :productId
      AND i.size = :size
      AND i.stockQuantity >= :orderedQty
    """)
    int reduceStock(Long storeId,
                    Long productId,
                    String size,
                    int orderedQty);

    @Query("SELECT i FROM Inventory i " +
            "WHERE i.productId = :productId " +
            "AND (:size IS NULL OR i.size = :size) " +
            "AND i.storeId = :storeId " +
            "AND i.stockQuantity > 0")
    List<Inventory> checkAvailable(Long productId,
                                   Long storeId,
                                   String size);

    @Query("SELECT i FROM Inventory i " +
            "WHERE i.storeId = :storeId " +
            "AND i.stockQuantity > 0")
    List<Inventory> findAllAvailableInStore(Long storeId);


}