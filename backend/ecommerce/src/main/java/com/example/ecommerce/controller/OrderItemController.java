package com.example.ecommerce.controller;

import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.OrderItemRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order-items")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderItemController {

    private final OrderItemRepository orderItemRepo;
    private final ProductRepository productRepo;

    public OrderItemController(
            OrderItemRepository orderItemRepo,
            ProductRepository productRepo
    ) {
        this.orderItemRepo = orderItemRepo;
        this.productRepo = productRepo;
    }

    // ✅ GET ITEMS OF AN ORDER
    @GetMapping("/{orderId}")
    public List<Map<String, Object>> getOrderItems(
            @PathVariable Long orderId
    ) {

        List<OrderItem> items = orderItemRepo.findByOrderId(orderId);

        return items.stream().map(item -> {

            Product p = productRepo
                    .findById(item.getProductId())
                    .orElseThrow();

            Map<String, Object> map = new HashMap<>();
            map.put("name", p.getName());               // ✅ MATCH FRONTEND
            map.put("price", item.getPrice());
            map.put("quantity", item.getQuantity());
            map.put("total", item.getPrice() * item.getQuantity());
            map.put("imageUrl", p.getImageUrl());       // ✅ REQUIRED

            return map;
        }).toList();
    }
}
