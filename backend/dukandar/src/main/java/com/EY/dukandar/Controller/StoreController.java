package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Store;
import com.EY.dukandar.Service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @PostMapping
    public Store create(@RequestBody Store store) {
        return storeService.createStore(store);
    }

    @GetMapping("/{id}")
    public Store getById(@PathVariable Long id) {
        return storeService.getStoreById(id);
    }

    @GetMapping
    public List<Store> getAll() {
        return storeService.getAllStores();
    }

    @PutMapping("/{id}")
    public Store update(@PathVariable Long id, @RequestBody Store store) {
        return storeService.updateStore(id, store);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        storeService.deleteStore(id);
        return "Store deleted successfully.";
    }
}

