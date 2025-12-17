package com.EY.dukandar.Model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "wishlist",
        uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "productId", "size"})
)
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "productId", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String size;

    // Default constructor
    public Wishlist() {}

    // Parameterized constructor
    public Wishlist(Long userId, Product product, String size) {
        this.userId = userId;
        this.product = product;
        this.size = size;
    }

    // -------------------- GETTERS & SETTERS --------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }
}