package com.EY.dukandar.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;               // Example: "Black Formal Shirt"

    @Column(nullable = false, unique = true)
    private String sku;                // Unique product code

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String category;           // Example: "Shirts", "Winter Wear"

    @Column(name = "sub_category")
    private List<String> subCategory = new ArrayList<>();

    @Column(length = 1000)
    private String description;        // Used for vector DB search or embeddings

    @JsonProperty("image_url")
    private String imageUrl;           // For UI display
    @JsonProperty("model_url")
    private String modelUrl;           // Optional 3D model

    // Default constructor
    public Product() {}

    // All-args constructor
    public Product(Long id, String name, String sku, double price,
                    String brand, String category, String description,
                   String imageUrl, String modelUrl) {

        this.id = id;
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.brand = brand;
        this.category = category;
        this.description = description;
        this.imageUrl = imageUrl;
        this.modelUrl = modelUrl;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getModelUrl() { return modelUrl; }
    public void setModelUrl(String modelUrl) { this.modelUrl = modelUrl; }

    public List<String> getSubCategory() {
        return subCategory;
    }
    public void setSubCategory(List<String> subCategory) {
        this.subCategory = subCategory;
    }
}
