package com.monthlybudget.service;

import com.monthlybudget.dto.CategoryDTO;
import com.monthlybudget.entity.ExpenseCategory;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.ExpenseCategoryRepository;
import com.monthlybudget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ExpenseCategoryService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final UserRepository userRepository;

    public ExpenseCategoryService(ExpenseCategoryRepository expenseCategoryRepository, UserRepository userRepository) {
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryDTO> getCategoriesByUserId(Long userId) {
        return expenseCategoryRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public CategoryDTO getCategoryById(Long id) {
        ExpenseCategory category = expenseCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense category not found"));
        return toDTO(category);
    }

    public CategoryDTO createCategory(CategoryDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseCategory category = ExpenseCategory.builder()
                .user(user)
                .name(dto.getName())
                .description(dto.getDescription())
                .color(dto.getColor())
                .build();

        ExpenseCategory saved = expenseCategoryRepository.save(category);
        return toDTO(saved);
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        ExpenseCategory category = expenseCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense category not found"));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setColor(dto.getColor());

        ExpenseCategory saved = expenseCategoryRepository.save(category);
        return toDTO(saved);
    }

    public void deleteCategory(Long id) {
        expenseCategoryRepository.deleteById(id);
    }

    private CategoryDTO toDTO(ExpenseCategory category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .build();
    }
}
