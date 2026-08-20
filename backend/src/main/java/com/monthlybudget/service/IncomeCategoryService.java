package com.monthlybudget.service;

import com.monthlybudget.dto.CategoryDTO;
import com.monthlybudget.entity.IncomeCategory;
import com.monthlybudget.entity.User;
import com.monthlybudget.repository.IncomeCategoryRepository;
import com.monthlybudget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class IncomeCategoryService {

    private final IncomeCategoryRepository incomeCategoryRepository;
    private final UserRepository userRepository;

    public IncomeCategoryService(IncomeCategoryRepository incomeCategoryRepository, UserRepository userRepository) {
        this.incomeCategoryRepository = incomeCategoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryDTO> getCategoriesByUserId(Long userId) {
        return incomeCategoryRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public CategoryDTO getCategoryById(Long id) {
        IncomeCategory category = incomeCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income category not found"));
        return toDTO(category);
    }

    public CategoryDTO createCategory(CategoryDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        IncomeCategory category = IncomeCategory.builder()
                .user(user)
                .name(dto.getName())
                .description(dto.getDescription())
                .color(dto.getColor())
                .build();

        IncomeCategory saved = incomeCategoryRepository.save(category);
        return toDTO(saved);
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        IncomeCategory category = incomeCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income category not found"));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setColor(dto.getColor());

        IncomeCategory saved = incomeCategoryRepository.save(category);
        return toDTO(saved);
    }

    public void deleteCategory(Long id) {
        incomeCategoryRepository.deleteById(id);
    }

    private CategoryDTO toDTO(IncomeCategory category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .build();
    }
}
