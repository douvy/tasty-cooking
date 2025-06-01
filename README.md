# Tasty Cooking

A modern recipe collection website optimized for performance, accessibility, and visual appeal with no clutter, built with Next.js and TypeScript.

## [Live Demo](https://www.tasty.cooking/)

![Tasty Cooking Homepage](/public/assets/img/screenshot-home.jpg)

## Features

- **Lightning Fast**: Built with Next.js for server-side rendering and static generation
- **Type Safety**: Fully typed with TypeScript for better developer experience and fewer bugs
- **Content as Code**: Recipes stored as MDX files for easy editing and version control
- **Fully Responsive**: Beautiful on all devices from mobile to desktop
- **Accessible**: WCAG compliant with proper semantic HTML and keyboard navigation
- **SEO Optimized**: Rich metadata, JSON-LD Schema.org markup, and optimized for search engines
- **Progressive Web App**: Works offline and can be installed on mobile devices
- **Beautiful Typography**: Custom fonts with attention to readability and aesthetics
- **High-Quality Images**: Optimized for fast loading with Next.js Image component
- **Clean Architecture**: Well-organized code structure for easy maintenance

## Screenshots

<div align="center">
  <img src="/public/assets/img/screenshot-recipe.jpg" alt="Recipe Page" width="45%">
  <img src="/public/assets/img/screenshot-recipe-mobile.jpg" alt="Mobile View" width="25%">
</div>

## Design Philosophy

Tasty Cooking was built with these principles in mind:

- **Minimalist Design**: Clean white title bars create visual breathing room and help content stand out. The high contrast ensures readability while maintaining elegance.

- **Typography**: We use a carefully selected font combination:
  - **Windsor Bold** for headings: A classic serif with personality that adds warmth and character
  - **GT Flexa** for body text: A modern sans-serif that ensures excellent readability at all sizes

- **Color Palette**: Our colors are inspired by natural cooking environments:
  - Moss green (#383d23): An earthy, organic tone that evokes nature and fresh ingredients
  - Parchment (#e2d7a0): A warm, soft hue reminiscent of vintage recipe cards and natural fibers
  - Strategic use of contrast: Creates visual hierarchy while maintaining a cohesive, natural feel

- **Performance First**: Every design decision was weighed against performance impact, ensuring a fast experience even on slower connections.

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/username/tasty-cooking.git
cd tasty-cooking-nextjs
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open your browser and visit http://localhost:3000

## Building for Production

```bash
npm run build
npm start
```

## Built With

- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at scale
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [MDX](https://mdxjs.com/) - Markdown for the component era (used for recipe content)

## Project Structure

```
tasty-cooking-nextjs/
├── public/            # Static assets (images, fonts)
│   ├── assets/
│   │   ├── fonts/     # Custom web fonts
│   │   └── img/       # Recipe and UI images
│   ├── manifest.json  # PWA manifest
│   └── robots.txt     # Robots file
├── src/               # Source code
│   ├── components/    # React components
│   ├── content/       # MDX content files
│   │   └── recipes/   # Recipe MDX files
│   ├── lib/           # Utility functions and services
│   ├── pages/         # Next.js pages
│   │   ├── api/       # API routes
│   │   └── [slug].tsx # Dynamic recipe pages
│   ├── styles/        # CSS styles
│   └── types/         # TypeScript type definitions
├── next.config.js     # Next.js configuration
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

If you found this project helpful, please consider giving it a star!

[Back to top](#tasty-cooking---nextjs-version)