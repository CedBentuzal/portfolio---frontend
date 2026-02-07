# Portfolio Website

A modern, responsive portfolio website built with **React** and **Tailwind CSS**. Features a clean, professional design with sections for Home, About, Portfolio, and Contact.

## Features

- Responsive design optimized for mobile, tablet, and desktop
- Smooth navigation with anchor links
- Modern gradient backgrounds and shadows
- Interactive contact form
- Portfolio showcase section
- Mobile-friendly hamburger menu
- Fast performance with Vite bundling

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Navigate to the project directory:
```bash
cd porfolio
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:5173/`

### Build for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Navigation.jsx    - Header with navigation menu
│   ├── Hero.jsx          - Landing/hero section
│   ├── About.jsx         - About section with services
│   ├── Portfolio.jsx     - Portfolio/projects showcase
│   ├── Contact.jsx       - Contact form section
│   └── Footer.jsx        - Footer component
├── App.jsx               - Main app component
├── index.css             - Tailwind CSS configuration
└── main.jsx              - Application entry point
```

## Customization

### Update Personal Information

Edit these sections to personalize your portfolio:

1. **Navigation** - Update social media links in src/components/Navigation.jsx
2. **Hero Section** - Update title and description in src/components/Hero.jsx
3. **About Section** - Update your services and bio in src/components/About.jsx
4. **Portfolio** - Add your projects in src/components/Portfolio.jsx
5. **Contact** - Update email and form settings in src/components/Contact.jsx

### Styling

All styles use Tailwind CSS utility classes. Modify colors and spacing in tailwind.config.js as needed.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal use.

---

Built with React & Tailwind CSS
