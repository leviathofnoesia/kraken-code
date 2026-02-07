/**
 * ESLint Rule: No Unguarded Console Statements in Hooks
 *
 * Prevents TUI leakage by enforcing that all console.log/warn/info
 * statements in hooks must use logger with SHOULD_LOG gating.
 * console.error is allowed for critical errors that must always be visible.
 *
 * @see https://eslint.org/docs/latest/extend-rules
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent TUI leakage from unguarded console statements in hooks',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [], // Use visitor pattern, not config pattern
  },

  create(context) {
    const sourceCode = context.sourceCode || ''

    // Check if logger is imported in this file
    const hasLoggerImport = /import\s+.*logger['"]/.test(sourceCode) ||
                                /from\s+['"][^'"]*logger['"]/.test(sourceCode) ||
                                /require\s*\(\s*logger\s*\)/.test(sourceCode)

    return {
      // Target all TypeScript files except tests
      files: ['**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/test/**',
        '**/node_modules/**',
        // Exclude non-hook directories that may legitimately use console
        'src/tools/**',
        'src/features/**',
        'src/config/**',
        'src/cli/**',
      ],

      rules: [
        {
          meta: {
            type: 'suggestion',
            docs: 'No unguarded console statements in hook files',
            fixable: 'code',
          },

          create(context) {
            return {
              Identifier(node) {
                // Check if this is a console method call
                if (
                  node.type === 'CallExpression' &&
                  node.callee.type === 'Identifier' &&
                  node.callee.name === 'console'
                ) {
                  const method = node.callee.property?.name

                  // console.error is ALWAYS allowed (critical errors must show)
                  if (method === 'error') {
                    return
                  }

                  // Only check log/warn/info in hook directories
                  const filename = context.filename || ''
                  const isHookFile = filename.includes('src/hooks/')

                  if (isHookFile && ['log', 'warn', 'info'].includes(method || '')) {
                    // If logger is available, suggest using it
                    if (hasLoggerImport) {
                      context.report({
                        node,
                        messageId: 'use-logger',
                        data: { method },
                        fix: `Replace with logger.${method || 'debug'}()`,
                      })
                    } else {
                      // Logger not available, suggest importing it
                      context.report({
                        node,
                        messageId: 'unguarded-console',
                        data: { method },
                        fix: [
                          // Add logger import at top of file
                          `import { createLogger } from '../../utils/logger'\n\n`,
                          // Create logger instance (after imports, before hooks)
                          `const logger = createLogger('${filename.split('/').slice(-2, -1).join('-')}')\n\n`,
                          // Replace console with logger call
                          `logger.${method || 'debug'}(`,
                        ].join(''),
                      })
                    }
                  }
                }
              },
            }
          },
      },
    }
  },
}
