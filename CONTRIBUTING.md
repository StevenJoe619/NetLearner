# Contributing to NetLearner

First off, thanks for taking the time to contribute! 🎉

NetLearner is a free, open-source network certification exam preparation platform supporting Cisco (CCNA, CCNP) and Huawei (HCIA, HCIP). Whether you're fixing a bug, adding a new question bank, or improving the exam engine, your contributions are welcome.

## Project Overview

- **Stack**: Pure frontend (HTML/JS/CSS) with localStorage for user data
- **Question format**: JSON-based question banks in `questions/` directory
- **Supported vendors**: Cisco, Huawei
- **Question types**: Single choice, multiple choice, fill-in-the-blank, drag-and-drop
- **Key mechanism**: Weighted random question selection from a large pool

> See [项目说明.md](./项目说明.md) and [项目计划书.md](./项目计划书.md) for project background and roadmap.

---

## How Can I Contribute?

### Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/StevenJoe619/NetLearner/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/StevenJoe619/NetLearner/issues/new). Choose the "Bug report" template.
- Include detailed steps to reproduce, browser/OS info, and screenshots if applicable.

### Suggesting Enhancements

- Open a new issue using the "Feature request" template to discuss your ideas.
- Tell us what problem you're trying to solve, not just what feature you want.

### Adding or Improving Question Banks

- Question banks live in `questions/` as JSON files.
- Follow the existing schema (see any `.json` file in `questions/` for reference).
- Each question must include: `id`, `question`, `options`, `answer`, `explanation`, `domain`, and `difficulty`.
- Ensure questions are based on official exam outlines, not copyrighted exam dumps.
- Run `tools/` validation scripts if available to verify format.

### Pull Requests

- Fill in the required template for Pull Requests.
- Keep changes focused — one PR should address one concern.
- Ensure any new code you add has been tested locally.
- For major changes, please open an issue first to discuss what you would like to change.
- If your change affects the exam engine (`scripts/`), verify existing question banks still work correctly.

---

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### Code Style

- Keep it simple — no unnecessary abstractions.
- Pure JavaScript, no framework dependencies.
- Comments should explain *why*, not *what*.
- Maintain backward compatibility for user data stored in localStorage.

### Question Bank Style

- Use consistent field naming across all JSON question files.
- Each question must belong to a valid exam domain.
- Provide meaningful explanations (not just "correct answer is X").
- Mark difficulty as `easy`, `medium`, or `hard`.

---

## Development Setup

NetLearner is a static frontend application — no build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/StevenJoe619/NetLearner.git
   cd NetLearner
   ```

2. Serve locally (choose one):
   ```bash
   # Using Node.js
   node server.js

   # Or using Python
   python -m http.server 8080

   # Or using VS Code Live Server extension
   ```

3. Open `http://localhost:8080` in your browser.

---

## Additional Notes

- By contributing, you agree that your contributions will be licensed under the MIT license.
- All learning data stays in the user's browser — be mindful of this when designing features.
- If you're unsure about anything, open an issue to discuss it first.
