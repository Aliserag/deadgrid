# DeadGrid Frontend

A modern, immersive frontend for the DeadGrid zombie apocalypse simulation game, built with Next.js.

## Features

- 🎮 Engaging main menu with smooth animations
- 🗺️ Interactive grid-based game interface
- 📊 Real-time game statistics and resource tracking
- ⚙️ Comprehensive settings panel
- 🎨 Dark, atmospheric theme
- 📱 Responsive design for all screen sizes
- ⚡ Next.js for optimal performance
- 🔄 Server-side rendering capabilities
- 🎯 TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:3000`.

## Development

### Project Structure

```
frontend/
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── game/      # Game page
│   │   ├── settings/  # Settings page
│   │   └── page.tsx   # Home page
│   ├── components/    # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── store/        # State management
│   ├── styles/       # Global styles and themes
│   └── utils/        # Utility functions
├── public/           # Static assets
├── next.config.js    # Next.js configuration
└── package.json      # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint for code quality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 