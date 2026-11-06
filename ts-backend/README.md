# TypeScript Chat Backend

A professional, modular TypeScript backend for a real-time chat application with WebSocket support, built with Express.js, Socket.IO, and MongoDB.

## 🚀 Features

- **TypeScript**: Fully typed codebase with strict type checking
- **Modular Architecture**: Clean, scalable modular pattern (not MVC)
- **Real-time Communication**: Socket.IO for instant messaging
- **Authentication**: JWT-based auth with access & refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Express-validator for request validation
- **Security**: CORS, cookie-based authentication, bcrypt password hashing
- **WebRTC Support**: Video/audio calling capabilities
- **Push Notifications**: Web push notifications support
- **Professional Error Handling**: Centralized error management
- **Type-safe**: Strong TypeScript types throughout

## 📁 Project Structure

```
ts-backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── environment.config.ts
│   │   └── database.config.ts
│   ├── core/                   # Core functionality
│   │   ├── database/
│   │   │   └── models/        # Mongoose models
│   │   ├── middlewares/       # Express middlewares
│   │   └── socket/            # Socket.IO management
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   ├── user/              # User module
│   │   ├── chat/              # Chat module
│   │   ├── admin/             # Admin module
│   │   └── notification/      # Notification module
│   ├── shared/                # Shared resources
│   │   ├── types/             # TypeScript interfaces & types
│   │   └── constants/         # Application constants
│   ├── utils/                 # Utility functions
│   ├── app.ts                 # Express app setup
│   └── index.ts               # Server entry point
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json
├── tsconfig.json              # TypeScript configuration
├── nodemon.json               # Nodemon configuration
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Steps

1. **Clone or navigate to the project**

   ```bash
   cd ts-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your actual values.

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
```

This runs the server with nodemon and ts-node for hot reloading.

### Production Mode

```bash
npm run build
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (when configured)

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Frontend URLs (for CORS)
FRONTEND_URL1=http://localhost:5173
FRONTEND_URL2=http://localhost:3000
FRONTEND_URL3=https://your-production-frontend.com

# Database
MONGODB_URL=mongodb://localhost:27017/chat-app

# JWT Keys
JSON_WEB_TOKEN_KEY=your-jwt-secret-key
ACCESS_TOKEN_KEY=your-access-token-key
REFRESH_TOKEN_KEY=your-refresh-token-key
RESET_PASSWORD_KEY=your-reset-password-key

# Email (SMTP)
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password

# Push Notifications
PUBLIC_VAPID_KEY=your-public-vapid-key
PRIVATE_VAPID_KEY=your-private-vapid-key

# Admin
ADMIN_LOGIN_PATH=/admin/secret-login
ADMIN_LOGIN_EMAIL=admin@example.com
ADMIN_LOGIN_PASSWORD=admin-secure-password
```

## 🏗️ Architecture

### Modular Pattern

The project follows a modular architecture where each feature is self-contained:

```
Module Structure:
├── module.repository.ts   # Data access layer
├── module.service.ts      # Business logic layer
├── module.controller.ts   # Request handling layer
├── module.routes.ts       # Route definitions
├── module.validation.ts   # Input validation
└── module.types.ts        # Module-specific types
```

### Benefits:

- ✅ High cohesion within modules
- ✅ Low coupling between modules
- ✅ Easy to test and maintain
- ✅ Scalable and flexible
- ✅ Clear separation of concerns

## 🔌 API Endpoints

### Authentication

- `GET /api/v1/auth` - Get authenticated user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/log-out` - Logout user

### User Management

- `POST /api/v1/user/register` - Register new user
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `GET /api/v1/user/search` - Search users

### Chat

- `GET /api/v1/chat` - Get all chats
- `POST /api/v1/chat` - Create new chat
- `GET /api/v1/chat/:id` - Get chat details
- `GET /api/v1/chat/:id/messages` - Get chat messages

### Admin

- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/stats` - Get platform statistics

## 🌐 Socket.IO Events

### Client → Server

- `NEW_MESSAGE` - Send a new message
- `START_TYPING` - User starts typing
- `STOP_TYPING` - User stops typing
- `CALL_USER` - Initiate audio/video call
- `ANSWER_CALL` - Answer incoming call
- `ICE_CANDIDATE` - WebRTC ICE candidate exchange
- `REJECT_CALL` - Reject incoming call

### Server → Client

- `NEW_MESSAGE` - Receive new message
- `NEW_MESSAGE_ALERT` - New message notification
- `REFETCH_CHATS` - Refresh chat list
- `INCOMING_CALL` - Incoming call notification
- `CALL_ANSWERED` - Call answered by recipient
- `CALL_REJECTED` - Call rejected
- `USER_OFFLINE` - User is offline

## 🧪 Testing

```bash
npm test
```

## 📦 Technologies Used

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: bcryptjs, cors, cookie-parser
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Email**: Nodemailer
- **Push Notifications**: web-push

## 🔒 Security Features

- JWT-based authentication
- HTTP-only secure cookies
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- MongoDB injection prevention
- Rate limiting (to be implemented)

## 🚀 Deployment

### Build for production

```bash
npm run build
```

The compiled files will be in the `dist/` directory.

### Environment setup

Ensure all environment variables are properly configured in production.

### Start production server

```bash
NODE_ENV=production npm start
```

## 📄 License

ISC

## 👨‍💻 Development

### Code Style

- Uses ESLint for linting
- Uses Prettier for formatting
- Follows TypeScript strict mode
- Uses ES modules (ESM)

### Conventions

- PascalCase for classes
- camelCase for functions and variables
- UPPER_SNAKE_CASE for constants
- Interfaces prefixed with `I`
- Async/await for asynchronous code

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain TypeScript strict type checking
3. Write meaningful commit messages
4. Add tests for new features
5. Update documentation as needed

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using TypeScript and modern Node.js practices**
