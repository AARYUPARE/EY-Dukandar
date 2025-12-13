package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Product;

import java.util.List;

public interface ProductService {
    Product createProduct(Product product);

    Product getProductById(Long id);

    List<Product> getAllProducts();

    Product updateProduct(Long id, Product productDetails);

    void deleteProduct(Long id);
}
