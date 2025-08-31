# Melissa Casole - UX/UI Portfolio

A modern, secure, and accessible UX/UI portfolio website showcasing professional case studies and design work.

## ✨ Features

- **🔐 Password Protection** - Secure access with eye icon toggle for password visibility
- **🎨 Sophisticated Dark Theme** - Material Design-inspired Better Stack aesthetic
- **📱 Responsive Design** - Mobile-first approach with modern breakpoints
- **🎭 GSAP Animations** - Subtle, delightful animations and transitions
- **♿ Accessibility First** - WCAG 2.1 AA compliant with semantic HTML
- **🏗️ Component-Based Architecture** - Modular SCSS for maintainability
- **📄 Case Study Pages** - Individual URLs for each project (resume-friendly)
- **📱 Social Integration** - LinkedIn, Dribbble, and GitHub profiles
- **📥 Resume Downloads** - Multiple download points throughout the site
- **🔍 SEO Optimized** - Semantic HTML structure and meta tags

## 🏗️ Architecture & Best Practices

### **HTML Structure**
- **Semantic HTML5** - Proper use of `<section>`, `<article>`, `<aside>`, `<nav>`, `<footer>`
- **Accessibility** - ARIA labels, semantic landmarks, keyboard navigation support
- **SEO Friendly** - Proper heading hierarchy, meta descriptions, structured content
- **No Inline Styles** - All styling centralized in CSS files

### **SCSS Organization**
- **Design System Variables** - Centralized color, typography, spacing, and elevation maps
- **Component-Based Architecture** - Modular SCSS with clear separation of concerns
- **Material Design Principles** - Following Google's Material Design guidelines
- **Responsive Mixins** - Consistent breakpoint management across components
- **Utility Functions** - Reusable color, typography, and spacing getters
- **Clean Architecture** - Base → Components → Layout → Utilities → Responsive

### **CSS Best Practices**
- **No Bootstrap Dependencies** - Custom design system for complete control
- **CSS Custom Properties** - Future-ready with CSS variables
- **Flexbox & Grid** - Modern layout techniques for responsive design
- **Performance Optimized** - Efficient selectors and minimal specificity conflicts
- **Maintainable Code** - Clear naming conventions and logical structure

## 🚀 Technologies

- **HTML5** - Semantic markup and accessibility
- **SCSS/Sass** - Advanced CSS preprocessing with variables and mixins
- **jQuery 3.7.1** - DOM manipulation and event handling
- **GSAP 3.12.2** - Professional animations and ScrollTrigger
- **Font Awesome 6.4.0** - Icon library
- **NPM** - Package management and build scripts

## 📁 Project Structure

```
macv6/
├── css/
│   ├── styles.scss          # Source SCSS file
│   └── styles.css           # Compiled CSS (generated)
├── js/
│   └── script.js            # JavaScript functionality
├── assets/
│   ├── images/              # Project images and graphics
│   ├── icons/               # Custom icons and SVGs
│   ├── docs/                # Resume and documents
│   └── other/               # Additional assets
├── index.html               # Main landing page
├── project1.html            # E-commerce case study
├── project2.html            # Mobile app case study
├── project3.html            # Healthcare platform case study
├── package.json             # NPM configuration
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🛠️ Setup & Development

### **Prerequisites**
- Node.js (v14 or higher)
- NPM (v6 or higher)

### **Installation**
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run build`

### **Build Commands**
- `npm run build` - Compile SCSS to CSS
- `npm run watch` - Watch for SCSS changes and auto-compile

## 🎨 Customization

### **Colors**
The portfolio uses a sophisticated dark theme inspired by Better Stack:
- **Primary**: Indigo/Purple (#6366f1)
- **Secondary**: Blue (#3b82f6)
- **Backgrounds**: Deep blacks and elevated surfaces
- **Text**: High contrast whites and grays
- **Status Colors**: Success, warning, error, and info variants

### **Typography**
- **Primary Font**: Inter (system font fallbacks)
- **Scale**: Material Design type scale (12px to 60px)
- **Weights**: Light (300) to Extra Bold (800)
- **Line Heights**: Tight, normal, and relaxed variants

### **Spacing**
- **Grid System**: 8dp Material Design grid
- **Scale**: 4px to 128px spacing units
- **Responsive**: Adaptive spacing for different screen sizes

### **Components**
All components are built using SCSS mixins and follow consistent patterns:
- **Buttons** - Base button styles with variants
- **Cards** - Elevated surfaces with hover effects
- **Navigation** - Responsive navbar with mobile menu
- **Forms** - Accessible form elements with validation
- **Modals** - Password protection with glass effects

## 📱 Responsive Design

### **Breakpoints**
- **XS**: 0px (mobile-first)
- **SM**: 600px (tablet portrait)
- **MD**: 960px (tablet landscape)
- **LG**: 1280px (desktop)
- **XL**: 1920px (large desktop)

### **Mobile Features**
- Touch-friendly interactions
- Optimized layouts for small screens
- Mobile-first navigation
- Responsive typography scaling

## ♿ Accessibility Features

- **WCAG 2.1 AA Compliance** - Meeting accessibility standards
- **Semantic HTML** - Proper document structure
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - ARIA labels and descriptions
- **High Contrast** - Readable color combinations
- **Focus Management** - Clear focus indicators

## 🔐 Security Features

- **Password Protection** - Client-side authentication
- **Session Management** - Secure session storage
- **Private Content** - Sensitive case studies protected
- **No External Dependencies** - Self-contained security

## 📊 Performance

- **Optimized CSS** - Efficient selectors and minimal specificity
- **Lazy Loading** - Images and content loaded as needed
- **Minified Assets** - Compressed CSS and JavaScript
- **CDN Resources** - Fast loading of external libraries
- **Responsive Images** - Optimized for different screen sizes

## 🧪 Testing

### **Browser Compatibility**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### **Device Testing**
- Desktop (1920px+)
- Laptop (1280px)
- Tablet (768px)
- Mobile (375px)

## 📈 Future Enhancements

- **CMS Integration** - Easy content management
- **Blog Section** - UX insights and articles
- **Portfolio Gallery** - Image-based project showcase
- **Contact Form** - Direct communication
- **Analytics** - User behavior tracking
- **PWA Features** - Offline capabilities

## 🤝 Contributing

This is a personal portfolio project, but suggestions and improvements are welcome through issues or discussions.

## 📄 License

© 2025 Melissa Casole. All rights reserved.

---

**Built with ❤️ for accessibility, user experience, and modern web standards.**
