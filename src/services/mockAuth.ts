// mockAuth.ts - Authentication service with simulated API calls

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Simulate a small user database
const users: User[] = [
  { id: "1", email: "test@example.com", name: "Test User" },
  {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
  },
  {
    id: "3",
    email: "demo@example.com",
    name: "Demo User",
  },
];

class MockAuthService {
  private currentUser: User | null = null;

  // Simulate network delay
  private delay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentials): Promise<User> {
    await this.delay();

    // Simple validation
    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }

    // Check if user exists (basic mock)
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // In a real app, we would verify password here
    // For simulation, we just assume password is correct if email matches

    this.currentUser = user;
    //localStorage.setItem("authUser", JSON.stringify(user));

    return user;
  }

  async register(data: RegisterData): Promise<User> {
    await this.delay(1200); // Slightly longer delay for registration

    // Validation
    if (!data.email || !data.password || !data.name) {
      throw new Error("All fields are required");
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user
    const newUser: User = {
      id: String(users.length + 1),
      email: data.email,
      name: data.name,
    };

    users.push(newUser);
    this.currentUser = newUser;
    //localStorage.setItem("authUser", JSON.stringify(newUser));

    return newUser;
  }

  async forgotPassword(email: string): Promise<boolean> {
    await this.delay();

    if (!email) {
      throw new Error("Email is required");
    }

    // Check if user exists
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error("User not found");
    }

    // In a real app, this would send a password reset email
    // Here we just return success
    return true;
  }

  async logout(): Promise<void> {
    await this.delay(300); // Quick logout

    this.currentUser = null;
    //localStorage.removeItem("authUser");
  }

  //   getCurrentUser(): User | null {
  //     if (!this.currentUser) {
  //       const storedUser = localStorage.getItem("authUser");
  //       if (storedUser) {
  //         this.currentUser = JSON.parse(storedUser);
  //       }
  //     }
  //     return this.currentUser;
  //   }

  //   isAuthenticated(): boolean {
  //     return this.getCurrentUser() !== null;
  //   }
}

const authServiceMock = new MockAuthService();
export default authServiceMock;
