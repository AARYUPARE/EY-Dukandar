package com.EY.dukandar.Service;

import com.EY.dukandar.Model.User;
import java.util.List;

public interface UserService {
    User createUser(User user);
    User getUserById(Long id);
    List<User> getAllUsers();
    User updateUser(Long id, User user);
    void deleteUser(Long id);
    User addLoyaltyPoints(Long userId, int points);

}
