/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#383d23',
        'secondary': '#e2d7a0',
        'button': '#c96d4e',
        'off-white': '#eeece6',
        'light-gray': '#efece5',
        'gray': '#929292',
        'dark-gray': '#141519',
      },
      fontFamily: {
        'windsor-bold': ['Windsor Bold', 'serif'],
        'gt-flexa': ['GT Flexa', 'sans-serif'],
      },
      borderColor: {
        'divider-all': '#31351c',
        'divider-b': '#31351c',
        'grayish-orange-all': '#b6ad9d',
        'light-grayish-orange-all': '#d7e0cc',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.light-gray'),
            h2: {
              color: theme('colors.light-gray'),
              fontFamily: theme('fontFamily.windsor-bold'),
            },
            h3: {
              color: theme('colors.light-gray'),
              fontFamily: theme('fontFamily.windsor-bold'),
            },
            strong: {
              color: theme('colors.secondary'),
            },
            a: {
              color: theme('colors.secondary'),
              '&:hover': {
                color: theme('colors.secondary'),
                textDecoration: 'underline',
              },
            },
            blockquote: {
              borderLeftColor: theme('colors.primary'),
            },
            code: {
              color: theme('colors.secondary'),
            },
            pre: {
              backgroundColor: theme('colors.dark-gray'),
            },
            ul: {
              li: {
                '&::marker': {
                  color: theme('colors.secondary'),
                },
              },
            },
            ol: {
              li: {
                '&::marker': {
                  color: theme('colors.secondary'),
                },
              },
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.light-gray'),
            a: {
              color: theme('colors.secondary'),
              '&:hover': {
                color: theme('colors.secondary'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}