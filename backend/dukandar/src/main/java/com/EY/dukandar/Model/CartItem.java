package com.EY.dukandar.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cart relationship
    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // Product relationship
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // NEW → directly store inventory reference
    @Column(nullable = false)
    private Long inventoryId;

    // NEW → storeId from Inventory for grouping orders
    @Column(nullable = false)
    private Long storeId;

    // Variant size
    @Column(nullable = false)
    private String size;

    // Quantity
    @Column(nullable = false)
    private int quantity;

    public CartItem() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long inventoryId) { this.inventoryId = inventoryId; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}