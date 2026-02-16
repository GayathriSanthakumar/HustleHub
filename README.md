# HUSTLEHUB

HustleHub is a dual-purpose platform that connects local vendors with customers and helps students/professionals find short-term gig jobs. It ensures fair pay with its AI-powered minimum wage feature. It offers location-based vendor discovery, a dynamic bidding system for better deals, and blockchain-backed verification for trust and transparency.

## 🚀 Features

### User Account

- Register and log in as a user
- Post service requests and product requests
- Receive and review quotations from businesses
- Accept or reject offers and interact with businesses
- View applied service providers and their contact details
- **Dashboard** with tabs for:
  - Service Accept: Browse and accept available services
  - Service Post: Post and manage your service requests
  - Product: Request products and manage bids
- **History**: View all your services accepted, posted, and products requested
- Real-time chat with businesses and service providers

### Business Account

- Register and log in as a business
- Post product requests and manage quotations
- Submit bids on product requests
- Accept service jobs and interact with users
- Manage quotations with dynamic lowest price updates
- View user product requests and bid history
- Maintain a Business Dashboard with:
  - User product requests
  - Submitted bids with images
  - Updates on accepted bids

## 🎯 Core Functionalities

- **Dynamic Price Updates**: Real-time updates on lowest bid prices
- **Service Accept**: Businesses can accept services and view job details with contact info
- **Multiple Job Acceptances**: Users can accept multiple service providers
- **Edit & View Posts**: Modify and track applied users and contact details
- **Quotation Listings**: Businesses can list their quotations and view real-time updates
- **UI Enhancements**: Icons and buttons for better navigation
- **Secure Authentication**: Session-based login for users and businesses
- **Real-time Chat**: WebSocket-based messaging system
- **History Tracking**: Comprehensive history of all user activities

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (with Drizzle ORM)
- **Real-time**: WebSocket (ws)
- **Authentication**: Passport.js with session management
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Development**: VS Code, Cursor

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (for production) or the project uses in-memory storage for development
- **Git** (for version control)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd HustleHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5000`
   - The server runs on port 5000 by default

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 📁 Project Structure

```
HustleHub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express server
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   ├── auth.ts             # Authentication logic
│   └── vite.ts             # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas
└── package.json            # Project dependencies
```

## 🔐 Environment Variables

For production deployment, you may need to set up environment variables. Currently, the project uses in-memory storage for development.

## 🚀 Deployment

The project can be deployed to platforms like:
- **Vercel** (recommended for frontend)
- **Railway** or **Render** (for backend)
- **Any Node.js hosting service**

### Build for Production

```bash
npm run build
npm start
```

## 🔮 Future Implementations

- Implement AI-driven recommendations for product/service matching
- Introduce payment integration for business transactions
- Enhance UI/UX for better user experience
- Develop a mobile-friendly version using React Native
- Improve security with OAuth authentication
- Add analytics for tracking user and business engagement
- Implement blockchain-backed verification system

## 🔒 Security Measures

- **Data Encryption**: Secure storage of user and business data
- **Role-Based Access Control (RBAC)**: Restrict user and business access to relevant features
- **Session Management**: Secure session handling to prevent unauthorized access
- **DDoS Protection**: Rate limiting and security measures against attacks
- **OAuth Authentication**: Future implementation for enhanced login security

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and TypeScript**
