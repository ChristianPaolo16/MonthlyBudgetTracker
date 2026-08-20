package com.monthlybudget.controller;

import com.monthlybudget.dto.CategorySummaryDTO;
import com.monthlybudget.dto.MonthlySummaryDTO;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(
            @RequestParam Integer month, @RequestParam Integer year) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(dashboardService.getMonthlySummary(userId, month, year));
    }

    @GetMapping("/expense-summary")
    public ResponseEntity<List<CategorySummaryDTO>> getExpenseCategorySummary(
            @RequestParam Integer month, @RequestParam Integer year) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(dashboardService.getExpenseCategorySummary(userId, month, year));
    }

    @GetMapping("/income-summary")
    public ResponseEntity<List<CategorySummaryDTO>> getIncomeCategorySummary(
            @RequestParam Integer month, @RequestParam Integer year) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(dashboardService.getIncomeCategorySummary(userId, month, year));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
