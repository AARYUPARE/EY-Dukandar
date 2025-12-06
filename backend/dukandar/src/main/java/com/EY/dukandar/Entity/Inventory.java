package com.EY.dukandar.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign key: Product
    @Column(nullable = false)
    private Long productId;

    // Foreign key: Store
    @Column(nullable = false)
    private Long storeId;

    @Column(nullable = false)
    private int stockQuantity;        // Number of pieces available

    // Optional: size-based inventory
    private String size;              // Example: "M", "L", "XL"

    @Column(nullable = false)
    private boolean available;        // true / false

    // Default constructor
    public Inventory() {}

    // Constructor
    public Inventory(Long id, Long productId, Long storeId,
                     int stockQuantity, String size, boolean available) {
        this.id = id;
        this.productId = productId;
        this.storeId = storeId;
        this.stockQuantity = stockQuantity;
        this.size = size;
        this.available = available;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
