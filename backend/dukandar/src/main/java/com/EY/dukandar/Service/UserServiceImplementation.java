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

        if (userDetails.getEmail() != null)
            user.setEmail(userDetails.getEmail());

        if (userDetails.getPhone() != null)
            user.setPhone(userDetails.getPhone());

        if (userDetails.getLoyaltyPoints() != 0)
            user.setLoyaltyPoints(userDetails.getLoyaltyPoints());

        if (userDetails.getImageUrl() != null)
            user.setImageUrl(userDetails.getImageUrl());

        if (userDetails.getPassword() != null)
            user.setPassword(userDetails.getPassword());

        return userRepository.save(user);
    }


    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

