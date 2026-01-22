package com.example.ecommerce.controller;

import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.CartRepository;
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
    private final CartRepository cartRepo;

    public OrderController(
            OrderRepository orderRepo,
            OrderItemRepository orderItemRepo,
            ProductRepository productRepo,
            CartRepository cartRepo
    ) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.productRepo = productRepo;
        this.cartRepo = cartRepo;
    }

    // ✅ PLACE ORDER FROM CART
    @PostMapping
    @Transactional
    public Order placeOrder() {
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

        // Get user's cart
        List<CartItem> cartItems = cartRepo.findByUserEmail(email);

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cart is empty"
            );
        }

        // Calculate total and validate stock
        double total = 0;
        for (CartItem item : cartItems) {
            Product product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found"
                    ));

            if (product.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName()
                );
            }

            total += product.getPrice() * item.getQuantity();
        }

        // Create order
        Order order = new Order();
        order.setUserEmail(email);
        order.setTotalAmount(total);
        Order savedOrder = orderRepo.save(order);

        // Create order items and reduce stock
        for (CartItem item : cartItems) {
            Product product = productRepo.findById(item.getProductId()).orElseThrow();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getId());
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItemRepo.save(orderItem);

            // Reduce stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepo.save(product);
        }

        // Clear cart
        cartRepo.deleteAll(cartItems);

        return savedOrder;
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
