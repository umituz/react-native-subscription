# README Template

Template for creating new documentation files.

**Usage**: Copy this template and replace content between brackets `{}` with actual information.

---

# `{Component/Hook/Module Name}`

{Brief description of what this component/hook/module does and its primary purpose.}

## Location

**Import Path**: `{Package import path}`

**File**: `{Relative path to source file}`

**Type**: `{Hook | Component | Module | Service | Repository | Domain}`

## Strategy

### `{Primary Operation/Function}` Flow

1. **{Step 1 Name}**
   - {Detail 1}
   - {Detail 2}

2. **{Step 2 Name}**
   - {Detail 1}
   - {Detail 2}

3. **{Step 3 Name}**
   - {Detail 1}
   - {Detail 2}

### Integration Points

- **{Dependency 1}**: `{Path to dependency}`
- **{Dependency 2}**: `{Path to dependency}`
- **{External Service}**: `{Service name if applicable}`

### Key Concepts

- **{Concept 1}**: {Explanation}
- **{Concept 2}**: {Explanation}
- **{Concept 3}**: {Explanation}

## Restrictions

### REQUIRED

- **{Requirement 1}**: {Details}
- **{Requirement 2}**: {Details}
- **{Requirement 3}**: {Details}

### PROHIBITED

- **NEVER** {Action 1}
- **NEVER** {Action 2}
- **DO NOT** {Action 3}

### CRITICAL SAFETY

- **ALWAYS** {Safety Rule 1}
- **ALWAYS** {Safety Rule 2}
- **NEVER** {Safety Rule 3}
- **MUST** {Safety Rule 4}

## Rules

### {Rule Category 1}

```typescript
// CORRECT
{Example of correct usage}

// INCORRECT - {Reason}
{Example of incorrect usage}
```

### {Rule Category 2}

```typescript
// CORRECT
{Example of correct usage}

// INCORRECT - {Reason}
{Example of incorrect usage}
```

### {Rule Category 3}

```typescript
// CORRECT
{Example of correct usage}

// INCORRECT - {Reason}
{Example of incorrect usage}
```

## AI Agent Guidelines

### When {Implementing/Using/Testing} {Component/Hook}

1. **Always** {Guideline 1}
2. **Always** {Guideline 2}
3. **Always** {Guideline 3}
4. **Never** {Guideline 4}
5. **Must** {Guideline 5}

### Integration Checklist

- [ ] {Check item 1}
- [ ] {Check item 2}
- [ ] {Check item 3}
- [ ] {Check item 4}
- [ ] {Check item 5}

### Common Patterns to Implement

1. **{Pattern 1 Name}**: {Description}
2. **{Pattern 2 Name}**: {Description}
3. **{Pattern 3 Name}**: {Description}
4. **{Pattern 4 Name}**: {Description}
5. **{Pattern 5 Name}**: {Description}

### Error Handling

- **{Error 1}**: {How to handle}
- **{Error 2}**: {How to handle}
- **{Error 3}**: {How to handle}

## Related Documentation

- **{Related Item 1}**: {Description and path}
- **{Related Item 2}**: {Description and path}
- **{Related Item 3}**: {Description and path}
- **{Related Item 4}**: {Description and path}

## Additional Notes

{Any additional information, warnings, or special considerations}

---

## Template Guidelines

### Section Explanations

**Location**: Where to find the code and how to import it

**Strategy**: High-level approach, flow, integration points, and key concepts

**Restrictions**:
- **REQUIRED**: What MUST be provided/implemented
- **PROHIBITED**: What MUST NOT be done
- **CRITICAL SAFETY**: Critical safety rules that MUST be followed

**Rules**: Code examples showing CORRECT vs INCORRECT usage patterns

**AI Agent Guidelines**: Instructions for AI agents when implementing this component/hook

### What to Include

✅ **DO Include**:
- Import paths and file locations
- Strategy/flow descriptions
- Integration points and dependencies
- Required/prohibited actions
- Correct/incorrect code examples
- AI agent guidelines
- Checklists
- Related documentation links

❌ **DO NOT Include**:
- Full implementation code examples
- Long usage examples
- Tutorials or step-by-step guides
- Code that may become outdated
- Detailed API documentation (keep in code)

### Formatting Rules

1. **Bold Keywords**: Use **BOLD** for emphasis (ALWAYS, NEVER, MUST, REQUIRED)
2. **Code Blocks**: Only for CORRECT/INCORRECT comparisons
3. **Bullet Points**: Use for lists and checklists
4. **Path References**: Always use backticks for paths
5. **Links**: Use relative paths for related docs

### Updating Documentation

- Update when **API changes** (parameters, return types)
- Update when **restrictions change** (new requirements/prohibitions)
- Update when **dependencies change**
- **DO NOT** update for implementation changes only
- **DO NOT** update for bug fixes
- **DO NOT** update for refactoring

### Review Process

Before committing documentation:

1. [ ] All sections complete
2. [ ] No full code examples (only correct/incorrect snippets)
3. [ ] All paths are accurate
4. [ ] Strategy section is clear
5. [ ] Restrictions are comprehensive
6. [ ] AI agent guidelines are actionable
7. [ ] Related docs are linked
8. [ ] No typos or grammatical errors
