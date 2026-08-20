package com.monthlybudget.service;

import com.monthlybudget.dto.CategorySummaryDTO;
import com.monthlybudget.dto.ExpenseDTO;
import com.monthlybudget.entity.Account;
import com.monthlybudget.entity.Expense;
import com.monthlybudget.entity.ExpenseCategory;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.repository.ExpenseCategoryRepository;
import com.monthlybudget.repository.ExpenseRepository;
import com.monthlybudget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final AccountRepository accountRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository,
                          ExpenseCategoryRepository expenseCategoryRepository, AccountRepository accountRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.accountRepository = accountRepository;
    }

    public List<ExpenseDTO> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public ExpenseDTO getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return toDTO(expense);
    }

    public ExpenseDTO createExpense(ExpenseDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseCategory category = expenseCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Expense category not found"));

        Expense.ExpenseBuilder builder = Expense.builder()
                .user(user)
                .category(category)
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .expenseDate(dto.getExpenseDate());

        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            builder.account(account);
        }

        Expense saved = expenseRepository.save(builder.build());
        return toDTO(saved);
    }

    public ExpenseDTO updateExpense(Long id, ExpenseDTO dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (dto.getCategoryId() != null) {
            ExpenseCategory category = expenseCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Expense category not found"));
            expense.setCategory(category);
        }
        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            expense.setAccount(account);
        }
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getExpenseDate());

        Expense saved = expenseRepository.save(expense);
        return toDTO(saved);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public List<ExpenseDTO> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<ExpenseDTO> getExpensesByCategory(Long userId, Long categoryId) {
        return expenseRepository.findByUserIdAndCategoryId(userId, categoryId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<CategorySummaryDTO> getCategorySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate);

        Map<Long, BigDecimal> categoryTotals = new LinkedHashMap<>();
        Map<Long, String> categoryNames = new LinkedHashMap<>();
        Map<Long, String> categoryColors = new LinkedHashMap<>();

        for (Expense expense : expenses) {
            Long catId = expense.getCategory().getId();
            categoryTotals.merge(catId, expense.getAmount(), BigDecimal::add);
            categoryNames.putIfAbsent(catId, expense.getCategory().getName());
            categoryColors.putIfAbsent(catId, expense.getCategory().getColor());
        }

        BigDecimal total = categoryTotals.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySummaryDTO> summaries = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : categoryTotals.entrySet()) {
            BigDecimal percentage = total.compareTo(BigDecimal.ZERO) > 0
                    ? entry.getValue().multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            summaries.add(CategorySummaryDTO.builder()
                    .categoryId(entry.getKey())
                    .categoryName(categoryNames.get(entry.getKey()))
                    .totalAmount(entry.getValue())
                    .percentage(percentage)
                    .color(categoryColors.get(entry.getKey()))
                    .build());
        }

        return summaries;
    }

    private ExpenseDTO toDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .categoryId(expense.getCategory() != null ? expense.getCategory().getId() : null)
                .accountId(expense.getAccount() != null ? expense.getAccount().getId() : null)
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .categoryName(expense.getCategory() != null ? expense.getCategory().getName() : null)
                .accountName(expense.getAccount() != null ? expense.getAccount().getName() : null)
                .build();
    }
}
