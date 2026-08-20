package com.monthlybudget.service;

import com.monthlybudget.dto.InvestmentDTO;
import com.monthlybudget.entity.Investment;
import com.monthlybudget.entity.InvestmentType;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.InvestmentRepository;
import com.monthlybudget.repository.InvestmentTypeRepository;
import com.monthlybudget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;
    private final InvestmentTypeRepository investmentTypeRepository;

    public InvestmentService(InvestmentRepository investmentRepository, UserRepository userRepository,
                             InvestmentTypeRepository investmentTypeRepository) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
        this.investmentTypeRepository = investmentTypeRepository;
    }

    public List<InvestmentDTO> getInvestmentsByUserId(Long userId) {
        return investmentRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public InvestmentDTO getInvestmentById(Long id) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        return toDTO(investment);
    }

    public InvestmentDTO createInvestment(InvestmentDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvestmentType investmentType = investmentTypeRepository.findById(dto.getInvestmentTypeId())
                .orElseThrow(() -> new RuntimeException("Investment type not found"));

        Investment investment = Investment.builder()
                .user(user)
                .investmentType(investmentType)
                .name(dto.getName())
                .description(dto.getDescription())
                .amountInvested(dto.getAmountInvested())
                .currentValue(dto.getCurrentValue())
                .purchaseDate(dto.getPurchaseDate())
                .maturityDate(dto.getMaturityDate())
                .expectedReturnRate(dto.getExpectedReturnRate())
                .actualReturnRate(dto.getActualReturnRate())
                .status(dto.getStatus())
                .build();

        Investment saved = investmentRepository.save(investment);
        return toDTO(saved);
    }

    public InvestmentDTO updateInvestment(Long id, InvestmentDTO dto) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));

        if (dto.getInvestmentTypeId() != null) {
            InvestmentType investmentType = investmentTypeRepository.findById(dto.getInvestmentTypeId())
                    .orElseThrow(() -> new RuntimeException("Investment type not found"));
            investment.setInvestmentType(investmentType);
        }
        investment.setName(dto.getName());
        investment.setDescription(dto.getDescription());
        investment.setAmountInvested(dto.getAmountInvested());
        investment.setCurrentValue(dto.getCurrentValue());
        investment.setPurchaseDate(dto.getPurchaseDate());
        investment.setMaturityDate(dto.getMaturityDate());
        investment.setExpectedReturnRate(dto.getExpectedReturnRate());
        investment.setActualReturnRate(dto.getActualReturnRate());
        investment.setStatus(dto.getStatus());

        Investment saved = investmentRepository.save(investment);
        return toDTO(saved);
    }

    public void deleteInvestment(Long id) {
        investmentRepository.deleteById(id);
    }

    public List<InvestmentDTO> getActiveInvestments(Long userId) {
        return investmentRepository.findByUserIdAndStatus(userId, "ACTIVE").stream()
                .map(this::toDTO)
                .toList();
    }

    public InvestmentDTO calculateReturns(Long id) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));

        if (investment.getCurrentValue() != null && investment.getAmountInvested() != null
                && investment.getAmountInvested().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal returnRate = investment.getCurrentValue()
                    .subtract(investment.getAmountInvested())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(investment.getAmountInvested(), 2, RoundingMode.HALF_UP);
            investment.setActualReturnRate(returnRate);
        }

        Investment saved = investmentRepository.save(investment);
        return toDTO(saved);
    }

    private InvestmentDTO toDTO(Investment investment) {
        return InvestmentDTO.builder()
                .id(investment.getId())
                .investmentTypeId(investment.getInvestmentType() != null ? investment.getInvestmentType().getId() : null)
                .name(investment.getName())
                .description(investment.getDescription())
                .amountInvested(investment.getAmountInvested())
                .currentValue(investment.getCurrentValue())
                .purchaseDate(investment.getPurchaseDate())
                .maturityDate(investment.getMaturityDate())
                .expectedReturnRate(investment.getExpectedReturnRate())
                .actualReturnRate(investment.getActualReturnRate())
                .status(investment.getStatus())
                .investmentTypeName(investment.getInvestmentType() != null ? investment.getInvestmentType().getName() : null)
                .build();
    }
}
