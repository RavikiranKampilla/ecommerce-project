package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET ALL PRODUCTS
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // GET PRODUCTS BY CATEGORY
    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategory(@PathVariable Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    // ✅ GET RECOMMENDED PRODUCTS (TOP 4 BY ID)
    @GetMapping("/recommended")
    public List<Product> getRecommendedProducts() {
        return productRepository.findTop4ByOrderByIdAsc();
    }
}
