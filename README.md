# SecureHealth - Blockchain Health Data Management

A modern, secure, and user-friendly health data management platform built with Next.js, TypeScript, and blockchain technology.

## 🚀 Features

### Core Functionality
- **Secure Health Records Management** - Store and manage medical records with end-to-end encryption
- **Insurance Claims Processing** - Streamline insurance claim submissions and tracking
- **Hospital Finder** - Locate healthcare facilities with detailed information
- **User Profile Management** - Comprehensive user profiles with medical and professional information
- **Settings & Privacy Controls** - Granular privacy and security settings

### Security Features
- **Blockchain Verification** - Health records verified on blockchain for tamper-proof storage
- **256-bit Encryption** - Military-grade encryption for all sensitive data
- **HIPAA Compliance** - Built with healthcare privacy regulations in mind
- **Secure Authentication** - Multi-factor authentication and secure session management

### Technical Features
- **Responsive Design** - Optimized for all devices and screen sizes
- **Real-time Updates** - Live data synchronization across devices
- **Offline Support** - Core functionality available offline
- **Advanced Search** - Powerful search and filtering capabilities
- **Export/Import** - Data portability and backup options

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications

### Backend
- **NestJS** - Scalable Node.js server framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database for flexible data storage
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing

### Blockchain & Storage
- **IPFS** - Decentralized file storage
- **Blockchain Integration** - Ethereum-based verification
- **Smart Contracts** - Automated verification processes

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- MongoDB instance
- IPFS node (optional for development)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blockchain-health-wallet/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3003
   NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
   NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ../backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3003
   MONGODB_URI=mongodb://localhost:27017/securehealth
   JWT_SECRET=your-super-secret-jwt-key
   IPFS_URL=https://ipfs.infura.io:5001
   BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   ```

4. **Start backend server**
   ```bash
   npm run start:dev
   ```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure environment variables in Vercel dashboard**
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_IPFS_URL` - IPFS gateway URL
   - `NEXT_PUBLIC_BLOCKCHAIN_URL` - Blockchain RPC URL
   - `NEXT_PUBLIC_USE_MOCK_DATA` - Set to "false" for production

### Manual Deployment

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
blockchain-health-wallet/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utility libraries and services
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── health-records/ # Health records module
│   │   ├── users/          # User management
│   │   └── main.ts         # Application entry point
│   └── package.json
└── README.md
```

## 🔧 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

#### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Code Quality
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for quality checks

## 🔒 Security

### Data Protection
- All sensitive data is encrypted using AES-256
- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- HTTPS enforcement in production

### Privacy Compliance
- HIPAA-compliant data handling
- User consent management
- Data retention policies
- Right to deletion support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core health records management
- ✅ User authentication and profiles
- ✅ Basic blockchain integration
- ✅ Responsive design

### Phase 2 (Next)
- 🔄 Advanced blockchain features
- 🔄 Mobile application
- 🔄 AI-powered health insights
- 🔄 Integration with health devices

### Phase 3 (Future)
- 📋 Telemedicine integration
- 📋 Insurance provider APIs
- 📋 Advanced analytics dashboard
- 📋 Multi-language support

---

**Built with ❤️ for secure health data management**