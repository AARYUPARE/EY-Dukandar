package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Store;
import com.EY.dukandar.Repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StoreServiceImplementation implements StoreService {

    private final StoreRepository storeRepository;

    @Autowired
    public StoreServiceImplementation(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    @Override
    public Store createStore(Store store) {
        return storeRepository.save(store);
    }

    @Override
    public Store getStoreById(Long id) {
        Optional<Store> storeOpt = storeRepository.findById(id);
        return storeOpt.orElse(null);
    }

    @Override
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @Override
    public Store updateStore(Long id, Store storeDetails) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        if (storeDetails.getName() != null)
            store.setName(storeDetails.getName());

        if (storeDetails.getAddress() != null)
            store.setAddress(storeDetails.getAddress());

        if (storeDetails.getImageUrl() != null)
            store.setImageUrl(storeDetails.getImageUrl());

        if (storeDetails.getPhone() != null)
            store.setPhone(storeDetails.getPhone());

        if (storeDetails.getLatitude() != null)
            store.setLatitude(storeDetails.getLatitude());

        if (storeDetails.getLongitude() != null)
            store.setLongitude(storeDetails.getLongitude());

        return storeRepository.save(store);
    }


    @Override
    public void deleteStore(Long id) {
        storeRepository.deleteById(id);
    }
}

