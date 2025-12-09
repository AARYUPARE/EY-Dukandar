package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product getProductById(Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        return productOpt.orElse(null);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> searchProducts(String name, String size) {
        // Normalize empty strings to null to trigger the correct query logic
        if (name != null && name.trim().isEmpty()) {
            name = null;
        }
        if (size != null && size.trim().isEmpty()) {
            size = null;
        }

        // If both are null, optionally return empty list or all products
        if (name == null && size == null) {
            return List.of(); // or productRepository.findAll();
        }

        return productRepository.searchByNameAndSize(name, size);
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

        if (productDetails.getSize() != null)
            product.setSize(productDetails.getSize());

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
