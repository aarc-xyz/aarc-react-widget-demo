# Contributing to Fund Kit Widget React Sample App

First off, thank you for considering contributing to the Fund Kit Widget React Sample App! It's people like you that make it such a great tool for everyone.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to [team@aarc.xyz](mailto:biz@aarc.xyz).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots or animated GIFs if possible
* Include your environment details (OS, browser, Node.js version, React version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain the behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the React/JavaScript/TypeScript styleguides
* Include tests for any new functionality
* Document new code based on the documentation styleguide
* End all files with a newline

## Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### React Style Guide

* Use functional components over class components
* Use hooks for state management
* Follow React naming conventions:
  * PascalCase for component names
  * camelCase for instance names
* Keep components small and focused
* Use TypeScript for type safety
* Follow proper component structure:
  ```tsx
  import React from 'react';
  
  interface Props {
    // Props definition
  }
  
  export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
    // Component logic
    return (
      // JSX
    );
  };
  ```

### JavaScript/TypeScript Style Guide

* Use 2 spaces for indentation
* Use semicolons
* Use single quotes
* Prefer template literals over string concatenation
* Use modern ES6+ features
* Add trailing commas
* Sort imports alphabetically
* Use meaningful variable names

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Documentation Style Guide

* Use Markdown
* Reference functions with parentheses: `functionName()`
* Reference React components with brackets: `[ComponentName]`
* Use code blocks with appropriate language syntax highlighting
* Keep line length to a maximum of 80 characters
* Use descriptive link texts instead of generic ones

## Project Structure

```
aarc-react-widget-demo/
├── src/
│   ├── components/    # React components
│   ├── config/        # Configuration files
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Root component
├── public/            # Static assets
└── index.html         # HTML entry point
```

## Setting Up Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Check linting:
   ```bash
   npm run lint
   ```

## Questions?

Feel free to contact the project maintainers if you have any questions or need clarification on any aspect of contributing to the project.

Thank you for your contributions! 🚀