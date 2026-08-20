package com.monthlybudget.controller;

import com.monthlybudget.dto.IncomeDTO;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.service.IncomeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/income")
@CrossOrigin(origins = "http://localhost:5173")
public class IncomeController {

    private final IncomeService incomeService;
    private final UserRepository userRepository;

    public IncomeController(IncomeService incomeService, UserRepository userRepository) {
        this.incomeService = incomeService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<IncomeDTO>> getAllIncome() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(incomeService.getIncomesByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeDTO> getIncomeById(@PathVariable Long id) {
        return ResponseEntity.ok(incomeService.getIncomeById(id));
    }

    @PostMapping
    public ResponseEntity<IncomeDTO> createIncome(@RequestBody IncomeDTO dto) {
        Long userId = getCurrentUserId();
        IncomeDTO created = incomeService.createIncome(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeDTO> updateIncome(@PathVariable Long id, @RequestBody IncomeDTO dto) {
        return ResponseEntity.ok(incomeService.updateIncome(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<IncomeDTO>> getIncomeByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(incomeService.getIncomeByDateRange(userId, startDate, endDate));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<IncomeDTO>> getIncomeByCategory(@PathVariable Long categoryId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(incomeService.getIncomeByCategory(userId, categoryId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
