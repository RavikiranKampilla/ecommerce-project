package com.example.ecommerce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private Long productId;
    private int quantity;

    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public Long getProductId() { return productId; }
    public int getQuantity() { return quantity; }

    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
