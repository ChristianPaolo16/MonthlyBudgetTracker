package com.monthlybudget.service;

import com.monthlybudget.dto.CategorySummaryDTO;
import com.monthlybudget.dto.IncomeDTO;
import com.monthlybudget.entity.Account;
import com.monthlybudget.entity.Income;
import com.monthlybudget.entity.IncomeCategory;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.repository.IncomeCategoryRepository;
import com.monthlybudget.repository.IncomeRepository;
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
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;
    private final IncomeCategoryRepository incomeCategoryRepository;
    private final AccountRepository accountRepository;

    public IncomeService(IncomeRepository incomeRepository, UserRepository userRepository,
                         IncomeCategoryRepository incomeCategoryRepository, AccountRepository accountRepository) {
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
        this.incomeCategoryRepository = incomeCategoryRepository;
        this.accountRepository = accountRepository;
    }

    public List<IncomeDTO> getIncomesByUserId(Long userId) {
        return incomeRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public IncomeDTO getIncomeById(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));
        return toDTO(income);
    }

    public IncomeDTO createIncome(IncomeDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        IncomeCategory category = incomeCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Income category not found"));

        Income.IncomeBuilder builder = Income.builder()
                .user(user)
                .category(category)
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .incomeDate(dto.getIncomeDate());

        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            builder.account(account);
        }

        Income saved = incomeRepository.save(builder.build());
        return toDTO(saved);
    }

    public IncomeDTO updateIncome(Long id, IncomeDTO dto) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (dto.getCategoryId() != null) {
            IncomeCategory category = incomeCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Income category not found"));
            income.setCategory(category);
        }
        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            income.setAccount(account);
        }
        income.setAmount(dto.getAmount());
        income.setDescription(dto.getDescription());
        income.setIncomeDate(dto.getIncomeDate());

        Income saved = incomeRepository.save(income);
        return toDTO(saved);
    }

    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }

    public List<IncomeDTO> getIncomeByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return incomeRepository.findByUserIdAndIncomeDateBetween(userId, startDate, endDate).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<IncomeDTO> getIncomeByCategory(Long userId, Long categoryId) {
        return incomeRepository.findByUserIdAndCategoryId(userId, categoryId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<CategorySummaryDTO> getCategorySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Income> incomes = incomeRepository.findByUserIdAndIncomeDateBetween(userId, startDate, endDate);

        Map<Long, BigDecimal> categoryTotals = new LinkedHashMap<>();
        Map<Long, String> categoryNames = new LinkedHashMap<>();
        Map<Long, String> categoryColors = new LinkedHashMap<>();

        for (Income income : incomes) {
            Long catId = income.getCategory().getId();
            categoryTotals.merge(catId, income.getAmount(), BigDecimal::add);
            categoryNames.putIfAbsent(catId, income.getCategory().getName());
            categoryColors.putIfAbsent(catId, income.getCategory().getColor());
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

    private IncomeDTO toDTO(Income income) {
        return IncomeDTO.builder()
                .id(income.getId())
                .categoryId(income.getCategory() != null ? income.getCategory().getId() : null)
                .accountId(income.getAccount() != null ? income.getAccount().getId() : null)
                .amount(income.getAmount())
                .description(income.getDescription())
                .incomeDate(income.getIncomeDate())
                .categoryName(income.getCategory() != null ? income.getCategory().getName() : null)
                .accountName(income.getAccount() != null ? income.getAccount().getName() : null)
                .build();
    }
}
