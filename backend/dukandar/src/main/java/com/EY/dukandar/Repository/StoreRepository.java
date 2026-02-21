package com.EY.dukandar.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.EY.dukandar.Model.Store;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {

    @Query("SELECT s FROM Store s WHERE s.id = :storeId")
    Store findByStoreId(Long storeId);
}
