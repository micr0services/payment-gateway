# Payment Gateway Web Application

A modern, responsive web application built with Next.js that provides a complete payment processing interface for the Payment Gateway platform. This frontend application offers seamless payment experiences with both Stripe and PayPal integration, transaction management, and business integration tools.

## 🎯 What This Application Covers

### Payment Processing Interface
- **Dual Payment Methods**: Dedicated, optimized forms for both Stripe and PayPal payments
- **Real-time Payment Processing**: Secure client-side payment handling with provider SDKs
- **Multi-Currency Support**: Support for USD, EUR, GBP, and other major currencies
- **Responsive Payment Forms**: Mobile-first design that works across all devices
- **Payment Confirmation**: Branded success and failure pages with clear user feedback

### Transaction Management
- **Transaction Dashboard**: Comprehensive view of all payment transactions
- **Advanced Filtering**: Filter transactions by gateway, status, date, and amount
- **Mobile-Responsive Tables**: Optimized transaction tables that hide non-essential columns on mobile
- **Transaction Details**: Detailed view of individual transactions with full metadata
- **Real-time Updates**: Live transaction status updates and notifications

### Business Integration Tools
- **Contact Forms**: SMS-enabled integration inquiry forms for business development
- **Admin Notifications**: Automated SMS alerts to administrators (+254793056960) for new inquiries
- **Email Collection**: Customer email capture for follow-up communications
- **Responsive Contact Pages**: Mobile-optimized forms with proper validation

### User Experience Features
- **Dark Theme Design**: Modern dark UI with custom color scheme (obsidian, gold, surface colors)
- **Smooth Animations**: CSS animations and transitions for enhanced user experience
- **Loading States**: Proper loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and recovery options
- **Accessibility**: WCAG compliant design with proper contrast and keyboard navigation

### Technical Features
- **Next.js 14**: Latest App Router with server and client components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom dark theme variables
- **API Integration**: RESTful API communication with the Cloudflare Workers backend
- **State Management**: React hooks and context for local state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Running backend API (Cloudflare Workers)

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
# NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📱 Application Structure

### Public Pages
- **Home (`/`)**: Transaction dashboard with filtering and search
- **Payment Pages**:
  - `/payment/stripe` - Stripe payment form
  - `/payment/paypal` - PayPal payment form
- **Result Pages**:
  - `/success` - Stripe payment success
  - `/cancel` - Stripe payment cancellation
  - `/paypal/success` - PayPal payment success
  - `/paypal/cancel` - PayPal payment cancellation
- **Business Pages**:
  - `/integrations` - Business integration contact form
  - `/projects` - Project showcase/portfolio

### API Routes
- `/api/integrations` - Handle integration form submissions with SMS notifications
- `/api/transactions` - Fetch transaction data with filtering
- `/api/transactions/[id]` - Get specific transaction details

## 🎨 Design System

### Color Palette
- **Primary**: Gold (`#c9a84c`) - accents and highlights
- **Background**: Obsidian (`#0a0a0a`) - main background
- **Surface**: Surface variants for cards and overlays
- **Text**: Text colors with proper contrast ratios

### Typography
- **Fonts**: Geist Sans (body) and Geist Mono (code)
- **Hierarchy**: Consistent heading scales and text sizing
- **Spacing**: Tailwind spacing scale for consistent layouts

### Components
- **Payment Forms**: Secure, validated input forms
- **Transaction Tables**: Responsive data tables with mobile optimization
- **Status Indicators**: Color-coded status badges and icons
- **Loading States**: Skeleton screens and spinners
- **Error Boundaries**: Graceful error handling and recovery

## 🔧 Key Features

### Payment Flow
1. **Amount & Currency Selection**: User selects payment amount and currency
2. **Payment Method Choice**: Switch between Stripe and PayPal
3. **Secure Processing**: Client-side payment processing with provider SDKs
4. **Confirmation**: Redirect to success/failure pages with clear messaging
5. **Transaction Recording**: Automatic transaction logging in database

### Transaction Management
1. **Dashboard View**: Paginated list of all transactions
2. **Filtering Options**: Filter by gateway, status, date range
3. **Mobile Optimization**: Hide ID and Transaction ID columns on mobile
4. **Detail View**: Click-through to individual transaction details
5. **Export Ready**: Structured data for potential export features

### Business Integration
1. **Contact Form**: Email and phone collection for business inquiries
2. **SMS Notifications**: Automatic SMS to admin phone (+254793056960)
3. **Form Validation**: Client and server-side validation
4. **Responsive Design**: Mobile-friendly form layout
5. **Success Feedback**: Confirmation messages and next steps

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Font Loading**: Optimized web font loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Appropriate caching headers and strategies

### Mobile Performance
- **Responsive Images**: Proper image sizing for different devices
- **Touch Targets**: Adequate touch target sizes for mobile
- **Fast Loading**: Optimized bundle sizes and loading strategies
- **Offline Support**: Service worker ready for PWA features

## 🚀 Deployment

### Recommended Platforms
- **Vercel**: Optimized for Next.js with global CDN
- **Netlify**: Great alternative with form handling
- **Railway**: Full-stack deployment with database
- **AWS Amplify**: Scalable cloud deployment

### Build Configuration
```javascript
// next.config.ts
{
  output: 'standalone',
  images: {
    domains: ['your-domain.com']
  },
  experimental: {
    appDir: true
  }
}
```

## 🤝 Contributing

1. Follow the existing code patterns and TypeScript conventions
2. Test on multiple devices and screen sizes
3. Ensure accessibility compliance
4. Add proper error handling and loading states
5. Update this README for any new features

## 📄 License

MIT License - see LICENSE file for details
