# Contributing to TeamUp

Thank you for considering contributing to TeamUp! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/teamup.git
   cd teamup
   ```
3. Install dependencies:
   ```bash
   npm install
   npm run server:install
   ```
4. Start the development server:
   ```bash
   npm run dev:all
   ```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch for feature integration
- Feature branches - Create from `develop` with format: `feature/your-feature-name`
- Bug fix branches - Create from `develop` with format: `fix/issue-description`

## Commit Guidelines

We follow semantic commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or refactoring tests
- `chore:` - Changes to build process or auxiliary tools

Example: `feat: add team search functionality`

## Pull Request Process

1. Update the README.md if needed
2. Ensure all tests pass
3. Update documentation if applicable
4. Submit your PR against the `develop` branch
5. Wait for code review and address any feedback

## Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write tests for new functionality
- Document public functions with JSDoc comments

## Testing

Run tests with:

```bash
npm test
```

## License

By contributing to TeamUp, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 