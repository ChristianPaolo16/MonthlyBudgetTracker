package com.monthlybudget.repository;

import com.monthlybudget.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserId(Long userId);

    List<Income> findByUserIdAndIncomeDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    List<Income> findByUserIdAndCategoryId(Long userId, Long categoryId);
}
