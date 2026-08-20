package com.monthlybudget.repository;

import com.monthlybudget.entity.InvestmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvestmentTypeRepository extends JpaRepository<InvestmentType, Long> {
}
