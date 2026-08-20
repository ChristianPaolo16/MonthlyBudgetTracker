package com.monthlybudget.controller;

import com.monthlybudget.dto.CategoryDTO;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.service.ExpenseCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-categories")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseCategoryController {

    private final ExpenseCategoryService expenseCategoryService;
    private final UserRepository userRepository;

    public ExpenseCategoryController(ExpenseCategoryService expenseCategoryService, UserRepository userRepository) {
        this.expenseCategoryService = expenseCategoryService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(expenseCategoryService.getCategoriesByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseCategoryService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        Long userId = getCurrentUserId();
        CategoryDTO created = expenseCategoryService.createCategory(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        return ResponseEntity.ok(expenseCategoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        expenseCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
