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
public class InvestmentDTO {

    private Long id;
    private Long investmentTypeId;
    private String name;
    private String description;
    private BigDecimal amountInvested;
    private BigDecimal currentValue;
    private LocalDate purchaseDate;
    private LocalDate maturityDate;
    private BigDecimal expectedReturnRate;
    private BigDecimal actualReturnRate;
    private String status;
    private String investmentTypeName;
}
