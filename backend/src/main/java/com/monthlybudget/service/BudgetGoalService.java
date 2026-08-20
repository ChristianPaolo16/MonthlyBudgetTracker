package com.monthlybudget.service;

import com.monthlybudget.dto.BudgetGoalDTO;
import com.monthlybudget.entity.BudgetGoal;
import com.monthlybudget.entity.ExpenseCategory;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.BudgetGoalRepository;
import com.monthlybudget.repository.ExpenseCategoryRepository;
import com.monthlybudget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BudgetGoalService {

    private final BudgetGoalRepository budgetGoalRepository;
    private final UserRepository userRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;

    public BudgetGoalService(BudgetGoalRepository budgetGoalRepository, UserRepository userRepository,
                             ExpenseCategoryRepository expenseCategoryRepository) {
        this.budgetGoalRepository = budgetGoalRepository;
        this.userRepository = userRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
    }

    public List<BudgetGoalDTO> getBudgetGoalsByUserId(Long userId) {
        return budgetGoalRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public BudgetGoalDTO getBudgetGoalById(Long id) {
        BudgetGoal budgetGoal = budgetGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget goal not found"));
        return toDTO(budgetGoal);
    }

    public BudgetGoalDTO createBudgetGoal(BudgetGoalDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseCategory category = expenseCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Expense category not found"));

        BudgetGoal budgetGoal = BudgetGoal.builder()
                .user(user)
                .category(category)
                .month(dto.getMonth())
                .year(dto.getYear())
                .budgetAmount(dto.getBudgetAmount())
                .build();

        BudgetGoal saved = budgetGoalRepository.save(budgetGoal);
        return toDTO(saved);
    }

    public BudgetGoalDTO updateBudgetGoal(Long id, BudgetGoalDTO dto) {
        BudgetGoal budgetGoal = budgetGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget goal not found"));

        if (dto.getCategoryId() != null) {
            ExpenseCategory category = expenseCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Expense category not found"));
            budgetGoal.setCategory(category);
        }
        budgetGoal.setMonth(dto.getMonth());
        budgetGoal.setYear(dto.getYear());
        budgetGoal.setBudgetAmount(dto.getBudgetAmount());

        BudgetGoal saved = budgetGoalRepository.save(budgetGoal);
        return toDTO(saved);
    }

    public void deleteBudgetGoal(Long id) {
        budgetGoalRepository.deleteById(id);
    }

    public List<BudgetGoalDTO> getBudgetGoalsByMonth(Long userId, Integer month, Integer year) {
        return budgetGoalRepository.findByUserIdAndMonthAndYear(userId, month, year).stream()
                .map(this::toDTO)
                .toList();
    }

    private BudgetGoalDTO toDTO(BudgetGoal budgetGoal) {
        return BudgetGoalDTO.builder()
                .id(budgetGoal.getId())
                .categoryId(budgetGoal.getCategory() != null ? budgetGoal.getCategory().getId() : null)
                .month(budgetGoal.getMonth())
                .year(budgetGoal.getYear())
                .budgetAmount(budgetGoal.getBudgetAmount())
                .categoryName(budgetGoal.getCategory() != null ? budgetGoal.getCategory().getName() : null)
                .build();
    }
}
