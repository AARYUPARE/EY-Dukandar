package com.EY.dukandar.Repository;

import com.EY.dukandar.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    @Modifying
    @Query("""
    UPDATE User u
    SET u.loyaltyPoints = u.loyaltyPoints + :points
    WHERE u.id = :userId
    """)
        int increaseLoyaltyPoints(Long userId, int points);
}
