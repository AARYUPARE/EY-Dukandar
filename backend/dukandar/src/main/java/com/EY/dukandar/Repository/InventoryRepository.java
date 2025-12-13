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

    /**
     * Atomically reduce stock (prevents oversell). Returns number of rows updated (0 or 1).
     * Requires calling method to be transactional.
     */
    @Query("UPDATE Inventory i SET i.stockQuantity = i.stockQuantity - :qty WHERE i.storeId = :storeId AND i.productId = :productId AND i.stockQuantity >= :qty")
    int reduceStockAtomic(@Param("storeId") Long storeId,
                          @Param("productId") Long productId,
                          @Param("qty") int qty);

    /**
     * Atomically increase stock (e.g., new shipment). Returns number of rows updated.
     */
    @Modifying
    @Query("UPDATE Inventory i SET i.stockQuantity = i.stockQuantity + :qty WHERE i.storeId = :storeId AND i.productId = :productId")
    int increaseStockAtomic(@Param("storeId") Long storeId,
                            @Param("productId") Long productId,
                            @Param("qty") int qty);
}
