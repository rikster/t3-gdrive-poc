# Project Architecture and Style Guidelines

A comprehensive collection of best practices, architecture patterns, and style guidelines

## Tech Stack

- **Language:** TypeScript
- **React Framework:** Next.js
- **Styling/Components:**
  - Tailwind CSS
  - shadcn/ui
  - Lucide (Icons)
- **Client State:** Context API
- **Animation:** Motion
- **Testing:**
  - Unit: Vitest
  - Component: React Testing Library
  - E2E: Playwright
- **Tables:** Tanstack Table
- **Forms:**
  - React-Hook-Form
  - Zod for validation
  - Works with shadcn
- **Database:** Supabase
- **Mobile:** React Native
- **Component Dev:** Storybook
- **Authentication:** Clerk
- **Hosting:** Vercel
- **IDE:** Cursor, Windsurf

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Route groups for authentication flows
│   ├── (dashboard)/        # Route groups for protected routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── ui/                 # shadcn components
│   ├── forms/              # Form components
│   └── [feature]/          # Feature-specific components
├── lib/                    # Utility functions, hooks, and types
│   ├── utils.ts            # General utilities
│   ├── validators.ts       # Zod schemas
│   └── types.ts            # TypeScript types/interfaces
├── hooks/                  # Custom React hooks
├── providers/              # Context providers
├── styles/                 # Global styles
├── public/                 # Static assets
└── tests/                  # Test files
```

## TypeScript Best Practices

### Use Explicit Types

- Use explicit type annotations for function parameters and return types
- Create dedicated type files for shared interfaces
- Leverage TypeScript's utility types (Pick, Omit, Partial)
- Use type guards for narrowing types
- Avoid `any` - use `unknown` when type is uncertain

```typescript
// Good
type User = {
  id: string;
  name: string;
  email: string;
};

// Use Pick for derived types
type UserPreview = Pick<User, "id" | "name">;

// Bad
const user: any = fetchUser();
```

### Type Organization

- Group related types in dedicated files
- Use exports to make types available throughout the app
- Consider namespaces for complex type hierarchies

```typescript
// lib/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: Date;
}
```

## Component Structure

### Component Organization

- Use functional components with TypeScript interfaces
- Export components as named exports (not default)
- Co-locate related files (component, test, styles if not using Tailwind)

```tsx
// components/UserCard/UserCard.tsx
import { FC } from 'react';
import { User } from '@/lib/types';

interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

export const UserCard: FC<UserCardProps> = ({
  user,
  onSelect
}) => {
  return (
    // ...component JSX
  );
};
```

### Component Composition

- Prefer composition over inheritance
- Create small, focused components
- Use prop drilling sparingly (use Context for deeply nested props)
- Implement the "Container/Presentational" pattern for complex components

```tsx
// Presentational component
export const UserList: FC<{ users: User[] }> = ({ users }) => {
  return (
    <ul className="space-y-4">
      {users.map((user) => (
        <li key={user.id}>
          <UserCard user={user} />
        </li>
      ))}
    </ul>
  );
};

// Container component
export const UserListContainer: FC = () => {
  const { users, isLoading, error } = useUsers();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return <UserList users={users} />;
};
```

## Tailwind and shadcn/ui Guidelines

### Tailwind Configuration

- Create a consistent color theme in `tailwind.config.js`
- Extend Tailwind's theme for custom design requirements
- Use design tokens for consistency

```js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ...other color definitions
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
```

### Component Styling

- Use shadcn/ui components as a foundation
- Create component variants with `cva` from `class-variance-authority`
- Use Tailwind's typography plugin for content-rich areas
- Extract common patterns into reusable components

```tsx
// Button with variants using class-variance-authority
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### Responsive Design

- Use Tailwind's responsive modifiers consistently
- Design for mobile-first, then scale up
- Use flex and grid layouts for complex UIs
- Test on various screen sizes

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id} className="p-4 md:p-6">
      {/* Card content */}
    </Card>
  ))}
</div>
```

## Form Handling

### Zod Schemas

- Define Zod schemas in dedicated files
- Create reusable validation schemas
- Use Zod's inference to derive TypeScript types

```tsx
// lib/validators.ts
import { z } from "zod";

export const userSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type UserFormValues = z.infer<typeof userSchema>;
```

### Form Components

- Use React Hook Form with Zod resolver
- Create reusable form components
- Build forms with shadcn/ui Form components
- Handle form state and errors consistently

```tsx
// components/forms/UserForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (data: UserFormValues) => void;
}

export function UserForm({ defaultValues, onSubmit }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Other form fields */}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## State Management

### Context API

- Use React Context selectively for shared state
- Create separate contexts for different domains
- Provide TypeScript interfaces for context values and actions
- Consider atomic state updates with useReducer for complex state

```tsx
// providers/UserProvider.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/lib/types";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add fetch user logic here with useEffect

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
```

### State Organization

- Keep state as close to components as possible
- Lift state up only when necessary
- Use custom hooks to encapsulate state logic
- Consider using reducers for complex state management

```tsx
// Complex state with useReducer
import { useReducer } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  total: number;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      // Add item logic
      return newState;
    }
    // Other cases...
    default:
      return state;
  }
};

export const useCart = () => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  // Helper functions
  const addItem = (item: CartItem) =>
    dispatch({ type: "ADD_ITEM", payload: item });

  return { cart, addItem /* other helpers */ };
};
```

## Testing Best Practices

### Unit Testing with Vitest

- Test pure functions thoroughly
- Mock external dependencies
- Focus on behavior, not implementation
- Keep tests small and focused

```typescript
// lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency, calculateTotal } from "./utils";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-50, "USD")).toBe("-$50.00");
  });
});

describe("calculateTotal", () => {
  it("calculates the sum of items", () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(35);
  });
});
```

### Component Testing

- Test components in isolation with React Testing Library
- Focus on user interaction and accessibility
- Test what the user sees, not implementation details
- Use the testing library's best practices

```tsx
// components/UserCard/UserCard.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  const mockUser = { id: "1", name: "Test User", email: "test@example.com" };
  const onSelect = vi.fn();

  it("renders user information correctly", () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    render(<UserCard user={mockUser} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(mockUser);
  });
});
```

### E2E Testing with Playwright

- Test critical user flows end-to-end
- Create page object models for complex pages
- Use test fixtures for common setup
- Test across multiple browsers

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("successful login", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Assert dashboard is loaded
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Welcome back");
  });

  test("failed login", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Assert error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText(
      "Invalid credentials",
    );
  });
});
```

## API and Database Integration

### API Client

- Create dedicated API client functions
- Use TypeScript for API response types
- Handle loading and error states consistently
- Implement retry logic and error handling

```typescript
// lib/api/users.ts
import { User } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await fetch("/api/users");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error("API Error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
```

### Data Fetching Hooks

- Create custom hooks for data fetching
- Implement loading, error, and success states
- Use React Query for complex data fetching needs
- Handle caching and refetching appropriately

```tsx
// hooks/useUsers.ts
import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { getUsers } from "@/lib/api/users";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getUsers();

        if (error) {
          setError(error);
          return;
        }

        if (data) {
          setUsers(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
}
```

### Supabase Integration

- Create a dedicated Supabase client
- Implement type-safe database access
- Use RLS (Row Level Security) for data protection
- Create helper functions for common database operations

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types"; // Generated types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper functions
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}
```

## Next.js Specific Guidelines

### App Router Best Practices

- Use React Server Components where appropriate
- Group related routes with route groups (parentheses folders)
- Implement proper loading and error handling
- Use server actions for form submissions

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2 border-t-2"></div>
    </div>
  );
}

// app/dashboard/error.tsx
("use client");

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
```

### Server Components vs Client Components

- Use Server Components by default
- Add 'use client' directive only when needed
- Keep data fetching close to where it's needed
- Prefer loading data in Server Components

```tsx
// Server Component (default)
import { getProducts } from "@/lib/api/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductList products={products} />
    </div>
  );
}

// Client Component
("use client");

import { useState } from "react";
import { Product } from "@/lib/types";

export function ProductList({ products }: { products: Product[] }) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedProducts = [...products].sort((a, b) => {
    return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
  });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
```

### Performance Optimization

- Implement proper image optimization with next/image
- Use React.memo for expensive components
- Implement virtualization for long lists (react-window or react-virtualized)
- Use incremental static regeneration for semi-dynamic content

```tsx
// Using next/image for optimized images
import Image from "next/image";

export function ProductImage({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="relative aspect-square">
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="rounded-md object-cover"
        priority={false}
      />
    </div>
  );
}
```

## Authentication with Clerk

- Set up Clerk middleware for protected routes
- Create authentication helpers
- Use Clerk components for auth UI
- Implement proper redirects and error handling

```tsx
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/login", "/signup", "/api/public(.*)"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

// app/(auth)/login/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
```

## Mobile and Responsive Development

- Implement responsive design with Tailwind's modifiers
- Use Next.js's dynamic imports for code splitting
- Consider React Native for mobile-specific features
- Test across various devices and screen sizes

```tsx
// components/responsive/ResponsiveLayout.tsx
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Dynamically import components based on screen size
const MobileNav = dynamic(() => import("./MobileNav"));
const DesktopNav = dynamic(() => import("./DesktopNav"));

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="min-h-screen">
      {isMobile ? <MobileNav /> : <DesktopNav />}
      <main className="container mx-auto px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}
```

## Deployment and CI/CD

- Set up continuous integration with GitHub Actions
- Use Vercel for hosting and preview deployments
- Implement environment variables for different environments
- Configure proper build caching

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run test:ci

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

## Code Quality and Linting

- Set up ESLint with proper rules
- Use Prettier for code formatting
- Implement pre-commit hooks with Husky
- Configure TypeScript's strict mode

```js
// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};
```

## Architecture Best Practices

### Feature-Based Organization

- Structure your codebase around business domains and features rather than technical concerns
- Group related components, hooks, types, and utilities together
- Use the "feature folder" pattern for scalable organization

```
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   └── products/
│       ├── components/
│       ├── hooks/
│       └── types.ts
```

### Domain-Driven Design (DDD)

- Define clear boundaries between different domains of your application
- Create domain-specific models and services
- Separate domain logic from UI and infrastructure concerns
- Use aggregates to enforce domain invariants

```typescript
// domain/product/models.ts
export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}

  public static create(props: Omit<Product, "id"> & { id?: string }): Product {
    const id = props.id || crypto.randomUUID();
    return new Product(id, props.name, props.price, props.stock);
  }

  public isInStock(): boolean {
    return this.stock > 0;
  }

  public canPurchase(quantity: number): boolean {
    return this.stock >= quantity;
  }
}
```

### Clean Architecture

- Implement a layered architecture to separate concerns
- Use dependency injection for better testability
- Structure code to flow dependencies inward (UI → Application → Domain)
- Keep business logic independent of frameworks

```
├── core/                # Domain and application layer
│   ├── domain/          # Business entities and logic
│   ├── application/     # Use cases and application services
│   └── interfaces/      # Repository and service interfaces
├── infrastructure/      # External concerns (API, DB)
│   ├── api/
│   ├── database/
│   └── services/
└── presentation/        # UI components and pages
    ├── components/
    ├── hooks/
    └── pages/
```

### Service Layer Pattern

- Create service classes or functions for complex operations
- Separate business logic from data fetching and UI
- Implement interfaces for services to enable mocking in tests
- Use dependency injection for flexible service composition

```typescript
// services/interfaces/productService.ts
export interface ProductService {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: CreateProductDTO): Promise<Product>;
}

// services/implementations/productService.ts
export class ProductServiceImpl implements ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Validation and business logic here
    const product = Product.create({
      name: data.name,
      price: data.price,
      stock: data.stock,
    });

    return this.productRepository.save(product);
  }
}
```

### Command Query Responsibility Segregation (CQRS)

- Separate read operations (queries) from write operations (commands)
- Optimize each path independently
- Use specialized models for different operations
- Implement command handlers and query handlers

```typescript
// commands/createOrder.ts
export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly items: Array<{ productId: string; quantity: number }>,
  ) {}
}

// command-handlers/createOrderHandler.ts
export class CreateOrderHandler {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    // Business logic
    const products = await this.productRepository.findByIds(
      command.items.map((item) => item.productId),
    );

    // Check inventory
    // Calculate totals
    // Create the order

    return this.orderRepository.save(order);
  }
}
```

### API Layer Architecture

- Create a dedicated API layer to abstract data fetching
- Implement consistent error handling
- Separate API concerns from UI components
- Use repositories to abstract data access

```typescript
// api/apiClient.ts
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }

  // Other methods: post, put, delete...
}

// repositories/productRepository.ts
export class ProductRepository {
  constructor(private readonly apiClient: ApiClient) {}

  async findAll(): Promise<Product[]> {
    const data = await this.apiClient.get<ProductDTO[]>("/products");
    return data.map((dto) => Product.fromDTO(dto));
  }

  // Other repository methods
}
```

### Server/Client Architecture (Next.js specific)

- Create a clear separation between server and client code
- Use React Server Components for data fetching and initial rendering
- Use Client Components for interactivity
- Implement clear patterns for data passing between server and client

```typescript
// app/products/page.tsx (Server Component)
import { getProducts } from '@/lib/api/products';
import { ProductList } from './components/ProductList';

export default async function ProductsPage() {
  // Server-side data fetching
  const products = await getProducts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {/* Pass server data to client component */}
      <ProductList initialProducts={products} />
    </div>
  );
}

// app/products/components/ProductList.tsx (Client Component)
'use client'

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';

export function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  // Client-side state based on initial server data
  const [products, setProducts] = useState(initialProducts);
  const [isFiltering, setIsFiltering] = useState(false);

  // Client-side interactivity
  // ...
}
```

### Modular Monolith

- Organize code into independent, loosely coupled modules
- Define clear interfaces between modules
- Use dependency inversion for module communication
- Enable selective extraction of modules into microservices

```
├── modules/
│   ├── auth/           # Authentication module
│   │   ├── api/
│   │   ├── components/
│   │   └── index.ts    # Public API
│   ├── products/       # Product module
│   │   ├── api/
│   │   ├── components/
│   │   └── index.ts    # Public API
│   └── orders/         # Order management module
│       ├── api/
│       ├── components/
│       └── index.ts    # Public API
```

### Error Handling Architecture

- Implement a consistent error handling strategy across the application
- Create custom error classes for different error types
- Use error boundaries for component-level error handling
- Implement error logging and monitoring

```typescript
// lib/errors/index.ts
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export class ApiError extends AppError {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends AppError {
  constructor(public readonly errors: Record<string, string>) {
    super("Validation Error");
    this.name = "ValidationError";
  }
}

// components/ErrorBoundary.tsx
("use client");

import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

### Performance Optimization Architecture

- Implement performance as an architectural concern
- Create optimization strategies for different aspects (network, rendering, etc.)
- Use code splitting and lazy loading
- Structure components to minimize re-renders

```typescript
// Lazy loading components
import dynamic from 'next/dynamic';

const DynamicDataTable = dynamic(() => import('@/components/DataTable'), {
  loading: () => <p>Loading...</p>,
  ssr: false // Disable server-side rendering for large components
});

// Optimizing re-renders with memoization
import { memo, useMemo, useCallback } from 'react';

export const UserList = memo(function UserList({ users, onUserSelect }: UserListProps) {
  // Only re-renders when users or onUserSelect changes

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const handleSelect = useCallback((userId: string) => {
    onUserSelect(userId);
  }, [onUserSelect]);

  return (
    <ul>
      {sortedUsers.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
});
```

### Microfrontend Architecture

- Divide large applications into smaller, independent frontends
- Use module federation for sharing code between microfrontends
- Implement clear contracts between microfrontends
- Create a shared component library

```typescript
// Setting up Module Federation in next.config.js
const NextFederationPlugin = require("@module-federation/nextjs-mf");

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: "host",
        filename: "static/chunks/remoteEntry.js",
        remotes: {
          remote1: "remote1@http://localhost:3001/static/chunks/remoteEntry.js",
          remote2: "remote2@http://localhost:3002/static/chunks/remoteEntry.js",
        },
        exposes: {
          "./Header": "./components/Header",
          "./Footer": "./components/Footer",
        },
        shared: ["react", "react-dom"],
      }),
    );

    return config;
  },
};
```

## Documentation Best Practices

- Document components with JSDoc
- Create README files for complex components or features
- Use Storybook for component documentation
- Maintain a project-wide documentation

````tsx
/**
 * A reusable button component with several variants and sizes
 *
 * @param variant - The visual style of the button
 * @param size - The size of the button
 * @param asChild - Whether to render as a child element
 * @param className - Additional CSS classes
 * @param children - Button content
 * @param props - All other button HTML attributes
 *
 * @example
 * ```tsx
 * <Button variant="destructive" size="sm" onClick={handleDelete}>
 *   Delete Item
 * </Button>
 * ```
 */
export function Button({
  variant = "default",
  size = "default",
  asChild = false,
  className,
  children,
  ...props
}: ButtonProps) {
  // Component implementation
}
````
