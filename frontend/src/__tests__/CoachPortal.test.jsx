import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CoachPortal from "../pages/CoachPortal";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

jest.mock("../context/AuthContext");
jest.mock("../services/api");

const mockCoach = {
  email: "coach@example.com",
  role: "ADMIN",
};

const mockSuperAdmin = {
  email: "admin@example.com",
  role: "SUPER_ADMIN",
};

const mockAnalyticsData = {
  players: [
    { age_group: "U-12", gender: "Male" },
    { age_group: "U-12", gender: "Female" },
    { age_group: "U-16", gender: "Male" },
  ],
  tournaments: [
    { status: "Upcoming" },
    { status: "Ongoing" },
    { status: "Completed" },
  ],
  admins: [{ role: "SUPER_ADMIN" }, { role: "ADMIN" }],
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("CoachPortal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders welcome banner with coach email for regular admin", () => {
    useAuth.mockReturnValue({ coach: mockCoach });
    renderWithRouter(<CoachPortal />);

    expect(screen.getByText("Welcome back, Coach!")).toBeInTheDocument();
    expect(screen.getByText(mockCoach.email)).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("shows Super Admin badge for super admin user", () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = { get: jest.fn() };
    renderWithRouter(<CoachPortal />);

    expect(screen.getByText("Super Admin")).toBeInTheDocument();
  });

  test("displays quick actions for regular admin", () => {
    useAuth.mockReturnValue({ coach: mockCoach });
    renderWithRouter(<CoachPortal />);

    expect(screen.getByText("Manage Players")).toBeInTheDocument();
    expect(screen.getByText("Manage Tournaments")).toBeInTheDocument();
    expect(screen.queryByText("Manage Admins")).not.toBeInTheDocument();
  });

  test("includes admin management link for super admin", () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = { get: jest.fn(() => Promise.resolve([])) };
    renderWithRouter(<CoachPortal />);

    waitFor(() => {
      expect(screen.getByText("Manage Admins")).toBeInTheDocument();
    });
  });

  test("does not fetch analytics for regular admin", () => {
    useAuth.mockReturnValue({ coach: mockCoach });
    renderWithRouter(<CoachPortal />);

    expect(screen.queryByText("Analytics Overview")).not.toBeInTheDocument();
  });

  test("fetches and displays analytics for super admin", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockAnalyticsData.players)
        .mockResolvedValueOnce(mockAnalyticsData.tournaments)
        .mockResolvedValueOnce(mockAnalyticsData.admins),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(screen.getByText("Analytics Overview")).toBeInTheDocument();
      expect(screen.getByText("Total Players")).toBeInTheDocument();
      expect(screen.getByText("Tournaments")).toBeInTheDocument();
      expect(screen.getByText("Admin Accounts")).toBeInTheDocument();
    });
  });

  test("displays loading spinner while fetching analytics", () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest.fn(() => new Promise(() => {})),
    };

    renderWithRouter(<CoachPortal />);

    const spinner = screen
      .getByRole("heading", { name: /Analytics Overview/i })
      .closest("div")
      .querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  test("displays error message when analytics fail to load", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest.fn().mockRejectedValue(new Error("API Error")),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load analytics data."),
      ).toBeInTheDocument();
    });
  });

  test("calculates age group distribution correctly", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockAnalyticsData.players)
        .mockResolvedValueOnce(mockAnalyticsData.tournaments)
        .mockResolvedValueOnce(mockAnalyticsData.admins),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(screen.getByText("Players by Age Group")).toBeInTheDocument();
      expect(screen.getByText(/U-12/)).toBeInTheDocument();
      expect(screen.getByText(/U-16/)).toBeInTheDocument();
    });
  });

  test("calculates gender distribution correctly", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockAnalyticsData.players)
        .mockResolvedValueOnce(mockAnalyticsData.tournaments)
        .mockResolvedValueOnce(mockAnalyticsData.admins),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(screen.getByText("Gender Distribution")).toBeInTheDocument();
      expect(screen.getByText("Boys")).toBeInTheDocument();
      expect(screen.getByText("Girls")).toBeInTheDocument();
    });
  });

  test("displays tournament status breakdown", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockAnalyticsData.players)
        .mockResolvedValueOnce(mockAnalyticsData.tournaments)
        .mockResolvedValueOnce(mockAnalyticsData.admins),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(screen.getByText("Tournament Status")).toBeInTheDocument();
      expect(screen.getByText("Upcoming")).toBeInTheDocument();
      expect(screen.getByText("Ongoing")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  test("displays admin access levels", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockAnalyticsData.players)
        .mockResolvedValueOnce(mockAnalyticsData.tournaments)
        .mockResolvedValueOnce(mockAnalyticsData.admins),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(screen.getByText("Admin Access Levels")).toBeInTheDocument();
      expect(screen.getByText("Super Admins")).toBeInTheDocument();
      expect(screen.getByText("Regular Admins")).toBeInTheDocument();
    });
  });

  test("handles nested API response structure", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest
        .fn()
        .mockResolvedValueOnce({ players: mockAnalyticsData.players })
        .mockResolvedValueOnce({ tournaments: mockAnalyticsData.tournaments })
        .mockResolvedValueOnce({ admins: mockAnalyticsData.admins }),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      expect(screen.getByText("Analytics Overview")).toBeInTheDocument();
    });
  });

  test("quick links have correct paths", () => {
    useAuth.mockReturnValue({ coach: mockCoach });
    renderWithRouter(<CoachPortal />);

    const playersLink = screen.getByRole("link", { name: /Manage Players/i });
    const tournamentsLink = screen.getByRole("link", {
      name: /Manage Tournaments/i,
    });

    expect(playersLink).toHaveAttribute("href", "/manage-players");
    expect(tournamentsLink).toHaveAttribute("href", "/manage-tournaments");
  });

  test("admin management link has correct path for super admin", async () => {
    useAuth.mockReturnValue({ coach: mockSuperAdmin });
    api.apiService = {
      get: jest.fn(() => Promise.resolve([])),
    };

    renderWithRouter(<CoachPortal />);

    await waitFor(() => {
      const adminLink = screen.getByRole("link", { name: /Manage Admins/i });
      expect(adminLink).toHaveAttribute("href", "/admin-management");
    });
  });
});
