package com.monthlybudget.service;

import com.monthlybudget.dto.AccountDTO;
import com.monthlybudget.entity.Account;
import com.monthlybudget.entity.AccountType;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.repository.AccountTypeRepository;
import com.monthlybudget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountTypeRepository accountTypeRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository,
                          AccountTypeRepository accountTypeRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountTypeRepository = accountTypeRepository;
    }

    public List<AccountDTO> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public AccountDTO getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return toDTO(account);
    }

    public AccountDTO createAccount(AccountDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AccountType accountType = accountTypeRepository.findById(dto.getAccountTypeId())
                .orElseThrow(() -> new RuntimeException("Account type not found"));

        Account account = Account.builder()
                .user(user)
                .accountType(accountType)
                .name(dto.getName())
                .accountNumber(dto.getAccountNumber())
                .balance(dto.getBalance() != null ? dto.getBalance() : BigDecimal.ZERO)
                .currency(dto.getCurrency())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        Account saved = accountRepository.save(account);
        return toDTO(saved);
    }

    public AccountDTO updateAccount(Long id, AccountDTO dto) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (dto.getAccountTypeId() != null) {
            AccountType accountType = accountTypeRepository.findById(dto.getAccountTypeId())
                    .orElseThrow(() -> new RuntimeException("Account type not found"));
            account.setAccountType(accountType);
        }
        account.setName(dto.getName());
        account.setAccountNumber(dto.getAccountNumber());
        account.setBalance(dto.getBalance());
        account.setCurrency(dto.getCurrency());
        account.setIsActive(dto.getIsActive());

        Account saved = accountRepository.save(account);
        return toDTO(saved);
    }

    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }

    public List<AccountDTO> getActiveAccounts(Long userId) {
        return accountRepository.findByUserIdAndIsActive(userId, true).stream()
                .map(this::toDTO)
                .toList();
    }

    public AccountDTO updateBalance(Long id, BigDecimal amount) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setBalance(account.getBalance().add(amount));

        Account saved = accountRepository.save(account);
        return toDTO(saved);
    }

    private AccountDTO toDTO(Account account) {
        return AccountDTO.builder()
                .id(account.getId())
                .accountTypeId(account.getAccountType() != null ? account.getAccountType().getId() : null)
                .name(account.getName())
                .accountNumber(account.getAccountNumber())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .isActive(account.getIsActive())
                .accountTypeName(account.getAccountType() != null ? account.getAccountType().getName() : null)
                .build();
    }
}
