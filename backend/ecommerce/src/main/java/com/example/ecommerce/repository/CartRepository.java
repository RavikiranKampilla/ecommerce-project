package com.example.ecommerce.repository;

import com.example.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserEmail(String userEmail);

    Optional<CartItem> findByUserEmailAndProductId(
            String userEmail,
            Long productId
    );
}
