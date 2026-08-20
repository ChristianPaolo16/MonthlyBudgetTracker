package com.monthlybudget.controller;

import com.monthlybudget.dto.BudgetGoalDTO;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.service.BudgetGoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget-goals")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetGoalController {

    private final BudgetGoalService budgetGoalService;
    private final UserRepository userRepository;

    public BudgetGoalController(BudgetGoalService budgetGoalService, UserRepository userRepository) {
        this.budgetGoalService = budgetGoalService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<BudgetGoalDTO>> getAllBudgetGoals() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(budgetGoalService.getBudgetGoalsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetGoalDTO> getBudgetGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetGoalService.getBudgetGoalById(id));
    }

    @PostMapping
    public ResponseEntity<BudgetGoalDTO> createBudgetGoal(@RequestBody BudgetGoalDTO dto) {
        Long userId = getCurrentUserId();
        BudgetGoalDTO created = budgetGoalService.createBudgetGoal(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetGoalDTO> updateBudgetGoal(@PathVariable Long id, @RequestBody BudgetGoalDTO dto) {
        return ResponseEntity.ok(budgetGoalService.updateBudgetGoal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudgetGoal(@PathVariable Long id) {
        budgetGoalService.deleteBudgetGoal(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/month")
    public ResponseEntity<List<BudgetGoalDTO>> getBudgetGoalsByMonth(
            @RequestParam Integer month, @RequestParam Integer year) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(budgetGoalService.getBudgetGoalsByMonth(userId, month, year));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
