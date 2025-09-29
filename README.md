# The Munchclub Admin Dashboard

A modern, responsive admin dashboard for The Munchclub platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Modern UI Design** - Clean, professional interface with dark/light mode support
- 📱 **Responsive Layout** - Works perfectly on desktop, tablet, and mobile devices
- 🔐 **Authentication Ready** - Built-in auth system with protected routes
- 📊 **Dashboard Analytics** - Real-time stats and metrics
- 👥 **User Management** - Complete user account management
- 📦 **Order Management** - Order tracking and fulfillment
- 📚 **Book Catalog** - Book inventory and management
- 👨‍🍳 **Recipe Management** - Recipe content management
- 💳 **Payment Tracking** - Payment processing and monitoring
- 🔌 **API Integration** - Ready to connect with your backend

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React hooks and context
- **API**: RESTful API integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to The Munchclub backend API

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd munchclub-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# Add other required environment variables
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Dashboard home page
│   ├── users/            # User management pages
│   ├── orders/           # Order management pages
│   ├── books/            # Book management pages
│   ├── recipes/          # Recipe management pages
│   └── payments/         # Payment management pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── Header.tsx        # Top navigation header
│   └── Sidebar.tsx       # Side navigation
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
    └── index.ts         # Main type definitions
```

## API Integration

The dashboard is designed to work with The Munchclub backend API. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your API endpoint.

### Available API Endpoints

- `GET /api/users` - Get all users
- `GET /api/orders` - Get all orders
- `GET /api/books` - Get all books
- `GET /api/recipes` - Get all recipes
- `GET /api/payments` - Get all payments
- `GET /api/dashboard/stats` - Get dashboard statistics

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/app/globals.css` for global styles
- Component-specific styles are co-located with components

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Update the navigation in `src/components/Sidebar.tsx`

### API Integration
- Update `src/lib/api.ts` to match your backend API
- Modify type definitions in `src/types/index.ts`
- Update components to use real API data

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.