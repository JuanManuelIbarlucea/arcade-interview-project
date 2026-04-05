import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useSearchParams: () => ({
    get: (_key: string) => null,
  }),
}));

import { SignUpForm } from "@/components/auth/sign-up-form";

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders name, email, and password fields", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows validation error when name is too short", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/full name/i), "A");
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows validation error when password is too short", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("redirects to /dashboard on successful signup", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: "1", email: "jane@example.com", referralCode: "ABC12345" },
      }),
    } as Response);

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "securepassword");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows server error when email is already taken", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "An account with this email already exists",
        field: "email",
      }),
    } as Response);

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "taken@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
