package com.monthlybudget.repository;

import com.monthlybudget.entity.BudgetGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetGoalRepository extends JpaRepository<BudgetGoal, Long> {

    List<BudgetGoal> findByUserId(Long userId);

    List<BudgetGoal> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
}
