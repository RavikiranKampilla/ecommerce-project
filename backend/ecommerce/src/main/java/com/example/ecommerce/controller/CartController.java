package com.example.ecommerce.controller;

import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;

    public CartController(CartRepository cartRepo,
                          ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
    }

    // ✅ ADD TO CART
    @PostMapping
    public CartItem addToCart(@RequestBody CartItem item) {

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        // ✅ FIX: correct authentication check
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please login to add to cart"
            );
        }

        String email = auth.getName();

        Product product = productRepo.findById(item.getProductId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"
                        )
                );

        return cartRepo
                .findByUserEmailAndProductId(email, item.getProductId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + item.getQuantity();

                    if (newQty > product.getStock()) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Only " + product.getStock() + " items left"
                        );
                    }

                    existing.setQuantity(newQty);
                    return cartRepo.save(existing);
                })
                .orElseGet(() -> {
                    if (item.getQuantity() > product.getStock()) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Only " + product.getStock() + " items left"
                        );
                    }

                    item.setUserEmail(email);
                    return cartRepo.save(item);
                });
    }

    // ✅ GET CART
    @GetMapping
    public List<Map<String, Object>> getCart() {

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please login"
            );
        }

        String email = auth.getName();
        List<CartItem> items = cartRepo.findByUserEmail(email);

        return items.stream().map(item -> {
            Product p = productRepo.findById(item.getProductId()).orElseThrow();

            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("productId", p.getId());
            map.put("name", p.getName());
            map.put("price", p.getPrice());
            map.put("imageUrl", p.getImageUrl());
            map.put("quantity", item.getQuantity());
            return map;
        }).toList();
    }

    // ✅ INCREASE
    @PutMapping("/increase/{id}")
    public CartItem increase(@PathVariable Long id) {
        CartItem item = cartRepo.findById(id).orElseThrow();
        Product p = productRepo.findById(item.getProductId()).orElseThrow();

        if (item.getQuantity() + 1 > p.getStock()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only " + p.getStock() + " items left"
            );
        }

        item.setQuantity(item.getQuantity() + 1);
        return cartRepo.save(item);
    }

    // ✅ DECREASE
    @PutMapping("/decrease/{id}")
    public CartItem decrease(@PathVariable Long id) {
        CartItem item = cartRepo.findById(id).orElseThrow();
        if (item.getQuantity() > 1) {
            item.setQuantity(item.getQuantity() - 1);
            return cartRepo.save(item);
        }
        return item;
    }

    // ✅ REMOVE
    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        cartRepo.deleteById(id);
    }
}
