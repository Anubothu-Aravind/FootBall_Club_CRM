# Anantapur Football Club - Home Page

## 🎯 Overview
A modern, responsive home page for Anantapur Football Club built with React and Tailwind CSS. Features smooth animations, a clean design, and an intuitive user interface.

## 🚀 Features

### 1. **Navigation Bar (NavBar.jsx)**
- Responsive design with mobile menu button
- Active state management for menu items
- Smooth transitions and hover effects
- Logo with club name and establishment year
- Red color theme matching brand identity

### 2. **Hero Section (HeroSection.jsx)**
- Full-width hero banner with gradient background
- Animated tagline: "Excellence on Every Field"
- Main title: "Anantapur Football Club"
- Descriptive subtitle about the club's mission
- Two call-to-action buttons:
  - **View Squad** (primary action)
  - **Join Academy** (secondary action)
- Decorative animated elements (pulsing circles)
- Staggered fade-in animations for content

### 3. **Stats Section (StatsSection.jsx)**
- Four key statistics displayed in cards:
  - **250+** Active Players
  - **12** Championships Won
  - **6** Years of Excellence
  - **4** Upcoming Tournaments
- Animated icons using Heroicons
- Hover effects with shadow and lift animation
- Responsive grid layout (1-4 columns)

### 4. **Tournaments Section (TournamentsSection.jsx)**
- Grid of upcoming tournament cards
- Each card displays:
  - Status badge (Upcoming, Registration Open, etc.)
  - Tournament name
  - Age group
  - Dates
  - Location
- Hover effects and staggered animations
- Responsive layout (1-4 columns)

### 5. **Footer Sections (FooterSections.jsx)**
- Three main sections:
  - **About Us**: Club history and mission
  - **Gallery**: Photos and videos
  - **Contact**: Get in touch information
- Copyright notice
- Links to Privacy Policy, Terms of Service, and Sitemap
- Hover effects on all interactive elements

## 🎨 Design Features

### Color Scheme
- **Primary Red**: `#dc2626` (red-600)
- **Dark Red**: `#b91c1c` (red-700)
- **Light Red**: `#fee2e2` (red-50)
- **Gray Tones**: Various shades for text and backgrounds
- **White**: Clean backgrounds

### Animations
1. **Fade-in Animation**
   - Smooth entrance for all major sections
   - Staggered delays for sequential elements
   - Opacity and transform transitions

2. **Hover Effects**
   - Scale transformation (1.05x)
   - Shadow elevation
   - Color transitions
   - Upward lift (-translate-y)

3. **Pulse Animation**
   - Decorative elements in hero section
   - Draws attention without distraction

### Responsive Design
- **Mobile**: Single column layout, hamburger menu
- **Tablet**: Two-column grids, optimized spacing
- **Desktop**: Full multi-column layout, expanded navigation

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── NavBar.jsx              # Navigation bar
│   ├── HeroSection.jsx         # Hero banner
│   ├── StatsSection.jsx        # Statistics cards
│   ├── TournamentsSection.jsx  # Tournaments grid
│   └── FooterSections.jsx      # Footer content
├── App.jsx                      # Main app component
├── index.css                    # Global styles and animations
└── main.jsx                     # Entry point
```

## 🛠️ Technologies Used

- **React 19.2.0**: UI library
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **Vite 7.2.4**: Build tool and dev server
- **Heroicons**: SVG icons (via inline SVG)

## 🎯 Code Quality

### Best Practices Implemented
1. **Component Documentation**: JSDoc comments for each component
2. **Semantic HTML**: Proper use of semantic elements
3. **Accessibility**: ARIA-friendly structure
4. **Maintainability**: Clean, readable code with comments
5. **Performance**: Optimized animations and transitions
6. **Responsive**: Mobile-first approach

### Animation Performance
- Uses `transform` and `opacity` for GPU-accelerated animations
- Smooth 60fps transitions
- No layout thrashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
The app will be available at `http://localhost:5174/` (or another port if 5173 is in use)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Customization Guide

### Changing Colors
Update the color classes in components:
- Primary: `bg-red-600`, `text-red-600`
- Hover: `hover:bg-red-700`
- Light backgrounds: `bg-red-50`

### Adding New Sections
1. Create new component in `src/components/`
2. Import in `App.jsx`
3. Add to the return statement
4. Follow existing animation patterns

### Modifying Animations
Edit `index.css` for global animations or use inline `style` prop for component-specific timing.

## 🔧 Maintenance

### Adding Tournament
Edit `TournamentsSection.jsx` and add new object to `tournaments` array:
```javascript
{
  title: 'Tournament Name',
  ageGroup: 'Under XX',
  dates: 'Month Day, Year',
  location: 'Venue Name',
  status: 'Status Text',
  statusColor: 'bg-red-600'
}
```

### Updating Stats
Edit `StatsSection.jsx` and modify the `stats` array with new values.

### Navigation Items
Edit `NavBar.jsx` and modify the `navItems` array.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance Optimization

- Lazy loading ready (can be added for images)
- Minimal CSS bundle size with Tailwind
- Fast HMR (Hot Module Replacement) with Vite
- Optimized production builds

## 📄 License

This project is part of the Anantapur Football Club website.

## 👥 Contributing

When contributing, ensure:
1. Code follows existing patterns
2. Components are documented
3. Tailwind classes are used (no inline styles)
4. Animations are smooth and purposeful
5. Mobile responsiveness is maintained

---

**Built with ❤️ for Anantapur Football Club**
