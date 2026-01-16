package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.OrderItemRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ProductRepository productRepo;

    public OrderController(
            OrderRepository orderRepo,
            OrderItemRepository orderItemRepo,
            ProductRepository productRepo
    ) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.productRepo = productRepo;
    }

    // ✅ CANCEL ORDER (USER SIDE) – FINAL
    @PutMapping("/{orderId}/cancel")
    @Transactional
    public void cancelOrder(@PathVariable Long orderId) {

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth == null || auth instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please login"
            );
        }

        String email = auth.getName();

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"
                        )
                );

        // 🔒 Ownership check
        if (!order.getUserEmail().equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not allowed"
            );
        }

        // ❌ Only PLACED orders allowed
        if (!order.getStatus().equalsIgnoreCase("PLACED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order cannot be cancelled"
            );
        }

        // 🔁 Restore stock
        List<OrderItem> items =
                orderItemRepo.findByOrderId(orderId);

        for (OrderItem item : items) {
            Product product = productRepo
                    .findById(item.getProductId())
                    .orElseThrow();

            product.setStock(
                    product.getStock() + item.getQuantity()
            );

            productRepo.save(product);
        }

        // ✅ Update order status
        order.setStatus("CANCELLED");
        orderRepo.save(order);
    }
}
