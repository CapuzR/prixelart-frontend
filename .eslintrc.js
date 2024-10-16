module.exports = {
    extends: [
      // other extensions here...
    ],
    plugins: ['unicorn'],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true, // Enforces camelCase for utilities/hooks/services
            pascalCase: true, // Enforces PascalCase for components and classes
            kebabCase: false, // You can enforce kebab-case if needed for certain files
          },
          // Customize based on file types (optional)
          ignore: [
            '\\.json$',  // Ignore JSON files
            '\\.config\\.js$',  // Ignore config files
            // Add other files to ignore
          ],
        },
      ],
    },
  };
  