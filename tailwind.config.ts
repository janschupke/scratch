import type { Config } from 'tailwindcss';
import { designTokens } from './src/styles/design-system';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vscode: designTokens.colors.vscode,
        semantic: designTokens.colors.semantic,
      },
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      zIndex: designTokens.zIndex,
    },
  },
  plugins: [
    // @ts-ignore
    require('@tailwindcss/forms'),
    // @ts-ignore
    require('@tailwindcss/typography'),
  ],
} satisfies Config; 
