package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserId(Long userId);

    Optional<Wishlist> findByUserIdAndProduct_IdAndSize(Long userId, Long productId, String size);

    void deleteByUserIdAndProduct_IdAndSize(Long userId, Long productId, String size);
}