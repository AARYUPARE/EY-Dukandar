package com.EY.dukandar.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;               // Example: "Black Formal Shirt"

    @Column(nullable = false)
    private String sku;                // Unique product code

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private String category;           // Example: "Shirts", "Winter Wear"

    @Column(nullable = false)
    private String subCategory;        // Example: "Formal", "Casual"

    @Column(length = 1000)
    private String description;        // Used for Vector DB embeddings

    private String imageUrl;           // For UI

    // Default constructor
    public Product() {}

    // Constructor
    public Product(Long id, String name, String sku, double price,
                   String category, String subCategory, String description, String imageUrl) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.price = price;
        this.category = category;
        this.subCategory = subCategory;
        this.description = description;
        this.imageUrl = imageUrl;
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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}

