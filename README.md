# <img src="public/stratafusion_icon_256x256.ico" alt="StrataFusion Logo" width="32" height="32" style="vertical-align: text-bottom; border-radius: 6px; margin-right: 8px;"> StrataFusion

StrataFusion is a unified cloud storage interface that allows users to access, manage, and search files across multiple cloud storage providers through a single application.

## Features

- **Unified Interface**: Access files from Google Drive, OneDrive, Dropbox, and more in one place
- **Cross-Platform Operations**: Move and copy files between different cloud storage services
- **Universal Search**: Search across all connected platforms simultaneously
- **Seamless Integration**: Open files in their native applications
- **Multi-Account Support**: Connect multiple accounts from the same service (e.g., personal and work Google Drive)
- **Responsive Design**: Mobile-first approach with responsive desktop experience

## Technology Stack

### Frontend

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **UI/Components**:
  - Tailwind CSS for styling
  - shadcn/ui for reusable components
  - Lucide for iconography
- **State Management**: React Context API
- **Tables**: Tanstack Table for file/folder listings
- **Forms**:
  - React-Hook-Form for form management
  - Zod for schema validation

### Backend & Infrastructure

- **Authentication**: Clerk for user authentication and role management
- **Database**: Supabase (PostgreSQL) when required
- **Hosting**: Vercel or Netlify
- **API Integration**: RESTful APIs for cloud service providers

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/stratafusion.git
   cd stratafusion
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Fill in the required API keys and credentials for the cloud services

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Configuration

### Environment Variables

The application uses different environment files for different environments:

- `.env.local`: Local development variables (not committed to git)
- `.env.development`: Development environment variables
- `.env.staging`: Staging environment variables
- `.env.production`: Production environment variables

Create a `.env.local` file with the following variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Drive
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

# OneDrive
ONEDRIVE_CLIENT_ID=your_onedrive_client_id
ONEDRIVE_CLIENT_SECRET=your_onedrive_client_secret
ONEDRIVE_REDIRECT_URI=http://localhost:3000/api/onedrive/callback

# Dropbox
DROPBOX_CLIENT_ID=your_dropbox_client_id
DROPBOX_CLIENT_SECRET=your_dropbox_client_secret
DROPBOX_REDIRECT_URI=http://localhost:3000/api/dropbox/callback

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Environment-Specific Configuration

For different environments, the application uses different site URLs:

- **Development**: `http://localhost:3000` (defined in `.env.development`)
- **Staging**: `https://staging.stratafusion.vercel.app` (defined in `.env.staging`)
- **Production**: `https://stratafusion.vercel.app` (defined in `.env.production`)

When deploying to different environments, make sure to update the `NEXT_PUBLIC_SITE_URL` in the corresponding environment file.

## Development

### Project Structure

```
stratafusion/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── api/       # API routes for cloud services
│   │   └── (routes)   # Application routes
│   ├── components/    # React components
│   │   ├── ui/        # UI components (shadcn/ui)
│   │   └── ...        # Feature-specific components
│   ├── contexts/      # React contexts
│   ├── lib/           # Utility functions and libraries
│   └── styles/        # Global styles
├── .env.example       # Example environment variables
├── next.config.js     # Next.js configuration
└── tailwind.config.js # Tailwind CSS configuration
```

### Building for Production

```bash
pnpm build
```

## Testing

### Continuous Integration

This project uses GitHub Actions for continuous integration. The CI pipeline runs automatically on:
- Every push to the `main` or `dev` branches
- Every pull request targeting the `main` or `dev` branches

The CI pipeline includes:
- Running all tests
- Type checking
- Linting
- Coverage reporting

You can view the CI status in the GitHub Actions tab of the repository.

### Test Commands

The project uses Vitest for testing. Here are the available test commands:

```bash
# Run tests once
pnpm test

# Run tests in watch mode (recommended during development)
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Writing Tests

Tests are co-located with their components in `*.test.tsx` files. Each test file should follow these conventions:

1. Import the component and its dependencies
2. Mock any external dependencies (contexts, hooks, etc.)
3. Write test cases for:
   - Expected use cases
   - Edge cases
   - Error states

Example test structure:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('renders successfully', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles edge cases', () => {
    render(<YourComponent prop={undefined} />)
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<YourComponent error="Error message" />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })
})
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Branding

The StrataFusion logo (`public/stratafusion_icon_256x256.ico`) represents the unified nature of the platform, bringing together multiple cloud storage services into a single, cohesive experience.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Clerk](https://clerk.dev/)
- [Tanstack Table](https://tanstack.com/table/v8)
