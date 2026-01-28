// Auth Module - Barrel Export
// Usage: import { LoginForm, SignupForm } from '@/modules/auth';

// Components
export { LoginForm } from "./components/LoginForm";
export { SignupForm } from "./components/SignupForm";

// Hooks
export { useLoginForm, useSignupForm } from "./hooks/useAuthForm";

// Types
export type { LoginFormData, SignupFormData } from "./hooks/useAuthForm";
