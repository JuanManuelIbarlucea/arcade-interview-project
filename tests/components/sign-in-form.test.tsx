import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

import { SignInForm } from "@/components/auth/sign-in-form";

describe("SignInForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("renders email and password fields with a submit button", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    // Never-resolving fetch to keep the loading state visible
    vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => {}));

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button")).toHaveTextContent(/signing in/i);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("redirects to /dashboard on successful sign-in", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "1", email: "test@example.com" } }),
    } as Response);

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error message when credentials are invalid", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid email or password" }),
    } as Response);

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "bad@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/invalid email or password/i);
    });
  });
});
