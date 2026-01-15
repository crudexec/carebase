module.exports = {
  // Lint TypeScript/JavaScript files
  "*.{ts,tsx,js,jsx}": ["eslint --fix --max-warnings=100"],
  // Format JSON files
  "*.json": ["prettier --write"],
  // Format Markdown files
  "*.md": ["prettier --write"],
};
