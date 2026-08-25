package com.monthlybudget.service;

import com.monthlybudget.dto.CategorySummaryDTO;
import com.monthlybudget.dto.MonthlySummaryDTO;
import com.monthlybudget.entity.Expense;
import com.monthlybudget.entity.Income;
import com.monthlybudget.repository.ExpenseRepository;
import com.monthlybudget.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    public DashboardService(ExpenseRepository expenseRepository, IncomeRepository incomeRepository) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
    }

    public MonthlySummaryDTO getMonthlySummary(Long userId, Integer month, Integer year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        BigDecimal totalIncome = incomeRepository.findByUserIdAndIncomeDateBetween(userId, startDate, endDate)
                .stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate)
                .stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpenses);

        return MonthlySummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .month(month)
                .year(year)
                .build();
    }

    public List<CategorySummaryDTO> getExpenseCategorySummary(Long userId, Integer month, Integer year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

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

    public List<CategorySummaryDTO> getIncomeCategorySummary(Long userId, Integer month, Integer year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

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

    public List<Map<String, Object>> getMonthlyExpensesTrend(Long userId) {
        List<Expense> allExpenses = expenseRepository.findByUserId(userId);

        Map<YearMonth, BigDecimal> monthlyTotals = new LinkedHashMap<>();
        for (Expense expense : allExpenses) {
            YearMonth ym = YearMonth.from(expense.getExpenseDate());
            monthlyTotals.merge(ym, expense.getAmount(), BigDecimal::add);
        }

        YearMonth current = YearMonth.now();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            BigDecimal total = monthlyTotals.getOrDefault(ym, BigDecimal.ZERO);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("amount", total);
            result.add(entry);
        }
        return result;
    }
}
