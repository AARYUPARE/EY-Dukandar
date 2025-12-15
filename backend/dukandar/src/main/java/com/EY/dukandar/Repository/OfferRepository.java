package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    // Get all active offers
    List<Offer> findByActiveTrue();

    // Get all offers where user's points are enough
    List<Offer> findByMinPointsRequiredLessThanEqual(int points);
}
