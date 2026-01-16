package com.example.ecommerce.controller;

import com.example.ecommerce.entity.*;
import com.example.ecommerce.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class CheckoutController {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;

    public CheckoutController(
            CartRepository cartRepo,
            ProductRepository productRepo,
            OrderRepository orderRepo,
            OrderItemRepository orderItemRepo
    ) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
    }

    // =======================
    // USER → CHECKOUT
    // =======================
    @PostMapping
    @Transactional
    public String checkout() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        List<CartItem> cartItems = cartRepo.findByUserEmail(email);

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cart is empty"
            );
        }

        double total = 0;

        for (CartItem item : cartItems) {
            Product p = productRepo.findById(item.getProductId())
                    .orElseThrow();

            if (item.getQuantity() > p.getStock()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only " + p.getStock() + " left for " + p.getName()
                );
            }

            total += p.getPrice() * item.getQuantity();
        }

        Order order = new Order();
        order.setUserEmail(email);
        order.setTotalAmount(total);

        order = orderRepo.save(order);

        for (CartItem item : cartItems) {
            Product p = productRepo.findById(item.getProductId())
                    .orElseThrow();

            OrderItem oi = new OrderItem();
            oi.setOrderId(order.getId());
            oi.setProductId(p.getId());
            oi.setQuantity(item.getQuantity());
            oi.setPrice(p.getPrice());

            orderItemRepo.save(oi);

            p.setStock(p.getStock() - item.getQuantity());
            productRepo.save(p);
        }

        cartRepo.deleteAll(cartItems);
        return "Order placed successfully";
    }

    // =======================
    // USER → OWN ORDERS
    // =======================
    @GetMapping
    public List<Order> getUserOrders() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return orderRepo.findByUserEmail(email);
    }

    // =======================
    // ADMIN → ALL ORDERS (🔥 IMPORTANT)
    // =======================
    @GetMapping("/admin")
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    // =======================
    // ADMIN → SHIP
    // =======================
    @PutMapping("/admin/{orderId}/ship")
    public String ship(@PathVariable Long orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Order not found"
                        )
                );

        if (!"PLACED".equals(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PLACED orders can be shipped"
            );
        }

        order.setStatus("SHIPPED");
        orderRepo.save(order);
        return "Order shipped";
    }

    // =======================
    // ADMIN → DELIVER
    // =======================
    @PutMapping("/admin/{orderId}/deliver")
    public String deliver(@PathVariable Long orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Order not found"
                        )
                );

        if (!"SHIPPED".equals(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only SHIPPED orders can be delivered"
            );
        }

        order.setStatus("DELIVERED");
        orderRepo.save(order);
        return "Order delivered";
    }
}
