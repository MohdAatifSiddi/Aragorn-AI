/**
 * PostCSS Configuration
 * 
 * Configures PostCSS for processing CSS in the Aragorn AI project.
 * PostCSS is a tool for transforming CSS with JavaScript plugins.
 * 
 * Plugins:
 * - @tailwindcss/postcss: Processes Tailwind CSS directives and utilities
 *   - Transforms @tailwind directives into actual CSS
 *   - Generates utility classes based on usage
 *   - Optimizes output for production
 * 
 * This minimal configuration is all that's needed for Tailwind CSS v4+
 * which has built-in PostCSS integration.
 * 
 * The plugin processes:
 * - @tailwind base - Tailwind's base styles
 * - @tailwind components - Component classes
 * - @tailwind utilities - Utility classes
 * 
 * @see https://tailwindcss.com/docs/installation/using-postcss
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
