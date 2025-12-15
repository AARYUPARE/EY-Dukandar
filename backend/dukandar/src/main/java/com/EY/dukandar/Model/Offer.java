package com.EY.dukandar.Model;

import jakarta.persistence.*;

@Entity
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String offerName;
    private String description;
    private int minPointsRequired;      // loyalty points needed
    private int discountPercentage;     // optional discount (5%, 10%)
    private boolean active = true;      // only show active offers

    // -----------------------
    // Constructors
    // -----------------------

    public Offer() {
    }

    public Offer(String offerName, String description, int minPointsRequired, int discountPercentage, boolean active) {
        this.offerName = offerName;
        this.description = description;
        this.minPointsRequired = minPointsRequired;
        this.discountPercentage = discountPercentage;
        this.active = active;
    }

    // -----------------------
    // Getters & Setters
    // -----------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOfferName() {
        return offerName;
    }

    public void setOfferName(String offerName) {
        this.offerName = offerName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getMinPointsRequired() {
        return minPointsRequired;
    }

    public void setMinPointsRequired(int minPointsRequired) {
        this.minPointsRequired = minPointsRequired;
    }

    public int getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(int discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
