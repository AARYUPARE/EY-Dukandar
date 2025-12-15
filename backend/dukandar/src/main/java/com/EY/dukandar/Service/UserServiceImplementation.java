package com.EY.dukandar.Service;

import com.EY.dukandar.Model.User;
import com.EY.dukandar.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImplementation implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        return userOpt.orElse(null);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDetails.getName() != null)
            user.setName(userDetails.getName());
        if (userDetails.getLocation() != null)
            user.setLocation(userDetails.getLocation());
        if (userDetails.getEmail() != null)
            user.setEmail(userDetails.getEmail());
        if (userDetails.getPhone() != null)
            user.setPhone(userDetails.getPhone());
        if (userDetails.getImageUrl() != null)
            user.setImageUrl(userDetails.getImageUrl());
        if (userDetails.getPassword() != null)
            user.setPassword(userDetails.getPassword());
        if (userDetails.getGender() != null)
            user.setGender(userDetails.getGender());
        if (userDetails.getDob() != null)
            user.setDob(userDetails.getDob());

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // ----------------------------------------------------------
    // ⭐ NEW METHOD (added without changing existing code)
    // ----------------------------------------------------------
    @Override
    public User addLoyaltyPoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int updatedPoints = user.getLoyaltyPoints() + points;
        user.setLoyaltyPoints(updatedPoints);

        return userRepository.save(user);
    }
}
