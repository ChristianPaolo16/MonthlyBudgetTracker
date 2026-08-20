package com.monthlybudget.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDTO {

    private Long id;
    private Long categoryId;
    private Long accountId;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String categoryName;
    private String accountName;
}
