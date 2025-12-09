package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByProductId(Long productId);

    List<Inventory> findByStoreId(Long storeId);

    Inventory findByStoreIdAndProductId(Long storeId, Long productId);
}
