package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
    SELECT p FROM Product p
    WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
    AND (:size IS NULL OR p.size = :size)
""")
    List<Product> searchByNameAndSize(
            @Param("name") String name,
            @Param("size") String size
    );



}
