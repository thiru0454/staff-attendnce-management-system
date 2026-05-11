# Contributing Guidelines

Thank you for your interest in contributing to the Staff Attendance Management System!

## 🎯 Development Workflow

### 1. Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/staff-pulse.git
cd staff-pulse

# Install dependencies
bun install

# Start development server
bun run dev
```

### 2. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Write clean, readable code
- Follow existing code patterns
- Add comments for complex logic
- Update TypeScript types as needed

### 4. Testing

- Test your changes locally: `bun run dev`
- Verify on mobile view (Chrome DevTools)
- Test error scenarios
- Check console for warnings/errors

### 5. Commit & Push

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub repository
- Click "Compare & pull request"
- Write clear description of changes
- Link any related issues
- Submit for review

## 📋 Commit Message Format

Follow conventional commits:

```
type(scope): subject

body

footer
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `style`: UI/styling changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `docs`: Documentation
- `test`: Testing additions

### Examples
```bash
git commit -m "feat(employees): add bulk employee import"
git commit -m "fix(attendance): prevent duplicate entries for same day"
git commit -m "style(dashboard): improve card spacing and alignment"
git commit -m "refactor(api): optimize database queries"
git commit -m "docs: add deployment instructions"
```

## 🎨 Code Style Guidelines

### TypeScript/React
```typescript
// Use functional components
function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="space-y-4">
      {employees.map(emp => (
        <EmployeeCard key={emp.id} employee={emp} />
      ))}
    </div>
  );
}

export default EmployeeList;
```

### Naming Conventions
- **Components**: PascalCase (`EmployeeList`, `AttendanceCard`)
- **Functions**: camelCase (`loadEmployees`, `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EMPLOYEES`, `API_TIMEOUT`)
- **Variables**: camelCase (`selectedDate`, `isLoading`)

### File Structure
```
components/
  ├── Employee/
  │   ├── EmployeeList.tsx
  │   ├── EmployeeForm.tsx
  │   └── EmployeeCard.tsx
  └── Common/
      ├── Header.tsx
      └── Sidebar.tsx
```

## 📝 Documentation

- Add JSDoc comments to functions:
```typescript
/**
 * Fetches employees from the database
 * @param departmentFilter - Optional department to filter by
 * @returns Promise resolving to array of employees
 */
async function fetchEmployees(departmentFilter?: string): Promise<Employee[]> {
  // ...
}
```

- Update README if adding new features
- Add comments for complex logic
- Keep documentation current

## 🧪 Testing Requirements

Before submitting a PR:
1. ✅ Code runs without errors
2. ✅ No TypeScript compilation errors
3. ✅ Features work as expected
4. ✅ Mobile responsiveness verified
5. ✅ No console errors/warnings
6. ✅ Existing features not broken

## ⚙️ Development Tools

### Available Scripts
```bash
bun run dev         # Start development server
bun run build       # Build for production
bun run preview     # Preview production build
bun run lint        # Run ESLint
bun run format      # Format code with Prettier
```

### VS Code Extensions (Recommended)
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- GitLens

## 🐛 Reporting Issues

When reporting bugs, include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/device information
- Screenshots if applicable

**Example Issue Title**: "Bug: Attendance not saving when marked as Late"

## ❓ Questions?

- Check existing issues/discussions
- Review documentation
- Ask in pull request comments
- Create a discussion thread

## 📦 Pull Request Checklist

Before submitting:
- [ ] Branch is up-to-date with main
- [ ] Code follows style guidelines
- [ ] All TypeScript types are correct
- [ ] No console errors/warnings
- [ ] Tested on desktop and mobile
- [ ] Updated README if needed
- [ ] Commits have meaningful messages
- [ ] No merge conflicts

## 🚀 Deployment After Merge

After PR is merged to main:
1. Changes automatically deploy to production (if using CD)
2. Monitor error logs
3. Verify in production environment
4. Communicate changes to team

## 📚 Resources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Git Workflow Guide](https://git-scm.com/book/en/v2)

---

**Happy Contributing!** 🎉
