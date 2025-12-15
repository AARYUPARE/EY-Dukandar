package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Store;
import java.util.List;

public interface StoreService {

    Store createStore(Store store);

    Store getStoreById(Long id);

    List<Store> getAllStores();

    Store updateStore(Long id, Store store);

    void deleteStore(Long id);

    // 🔥 NEW: Fetch stores having latitude & longitude
    List<Store> getStoresWithCoordinates();
}
