package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImplementation implements ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductServiceImplementation(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public List<Product> createProducts(List<Product> products) {

        List<Product> saved = new ArrayList<>();

        for (Product product : products) {
            if (!productRepository.existsBySku(product.getSku())) {
                saved.add(productRepository.save(product));
            }
        }

        return saved;
    }


    @Override
    public Product getProductById(Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        return productOpt.orElse(null);
    }

    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }


    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (productDetails.getName() != null)
            product.setName(productDetails.getName());

        if (productDetails.getSku() != null)
            product.setSku(productDetails.getSku());

        if (productDetails.getPrice() > 0)
            product.setPrice(productDetails.getPrice());

        if (productDetails.getBrand() != null)
            product.setBrand(productDetails.getBrand());

        if (productDetails.getCategory() != null)
            product.setCategory(productDetails.getCategory());

        if (productDetails.getSubCategory() != null)
            product.setSubCategory(productDetails.getSubCategory());

        if (productDetails.getDescription() != null)
            product.setDescription(productDetails.getDescription());

        if (productDetails.getImageUrl() != null)
            product.setImageUrl(productDetails.getImageUrl());

        if (productDetails.getModelUrl() != null)
            product.setModelUrl(productDetails.getModelUrl());

        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
