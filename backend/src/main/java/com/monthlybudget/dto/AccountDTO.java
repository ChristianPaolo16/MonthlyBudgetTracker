package com.monthlybudget.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDTO {

    private Long id;
    private Long accountTypeId;
    private String name;
    private String accountNumber;
    private BigDecimal balance;
    private String currency;
    private Boolean isActive;
    private String accountTypeName;
}
