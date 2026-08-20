package com.monthlybudget.controller;

import com.monthlybudget.dto.InvestmentDTO;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.service.InvestmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = "http://localhost:5173")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final UserRepository userRepository;

    public InvestmentController(InvestmentService investmentService, UserRepository userRepository) {
        this.investmentService = investmentService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<InvestmentDTO>> getAllInvestments() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(investmentService.getInvestmentsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentDTO> getInvestmentById(@PathVariable Long id) {
        return ResponseEntity.ok(investmentService.getInvestmentById(id));
    }

    @PostMapping
    public ResponseEntity<InvestmentDTO> createInvestment(@RequestBody InvestmentDTO dto) {
        Long userId = getCurrentUserId();
        InvestmentDTO created = investmentService.createInvestment(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentDTO> updateInvestment(@PathVariable Long id, @RequestBody InvestmentDTO dto) {
        return ResponseEntity.ok(investmentService.updateInvestment(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(@PathVariable Long id) {
        investmentService.deleteInvestment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvestmentDTO>> getActiveInvestments() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(investmentService.getActiveInvestments(userId));
    }

    @PostMapping("/{id}/calculate-returns")
    public ResponseEntity<InvestmentDTO> calculateReturns(@PathVariable Long id) {
        return ResponseEntity.ok(investmentService.calculateReturns(id));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
