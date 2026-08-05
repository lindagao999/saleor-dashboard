import { fireEvent, render, screen } from "@testing-library/react";
import { useIntl } from "react-intl";

import { type ListSettings } from "../../types";
import { TablePagination } from "./TablePagination";

const mockNavigate = jest.fn();

jest.mock("@dashboard/hooks/useNavigator", () => () => mockNavigate);

describe("TablePagination", () => {
  // The global react-intl mock returns the raw defaultMessage without
  // interpolating values - override it here to validate message formatting.
  beforeEach(() => {
    (useIntl as jest.Mock).mockReturnValue({
      formatMessage: jest.fn((descriptor, values) =>
        descriptor.defaultMessage.replace(
          /\{(\w+)\}/g,
          (match: string, key: string) => (values && key in values ? String(values[key]) : match),
        ),
      ),
      formatDate: jest.fn(x => x),
      formatTime: jest.fn(x => x),
      formatNumber: jest.fn(x => x),
      locale: "en",
    });
  });

  const defaultProps = {
    hasNextPage: true,
    hasPreviousPage: true,
    disabled: false,
  };

  it("renders pagination without settings", () => {
    // Arrange
    render(<TablePagination {...defaultProps} />);

    // Assert
    expect(screen.getByTestId("button-pagination-back")).toBeInTheDocument();
    expect(screen.getByTestId("button-pagination-next")).toBeInTheDocument();
    expect(screen.queryByText("No. of rows")).not.toBeInTheDocument();
  });

  it("renders pagination with row number selector", () => {
    // Arrange
    const settings: ListSettings = {
      rowNumber: 20,
    };

    // Act
    render(<TablePagination {...defaultProps} settings={settings} />);

    // Assert
    expect(screen.getByText("No. of rows")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("disables navigation based on hasNextPage/hasPreviousPage flags", () => {
    // Arrange
    render(<TablePagination {...defaultProps} hasNextPage={false} hasPreviousPage={false} />);

    // Assert
    expect(screen.getByTestId("button-pagination-back")).toBeDisabled();
    expect(screen.getByTestId("button-pagination-next")).toBeDisabled();
  });

  it("uses custom labels for row number selector", () => {
    // Arrange
    const settings: ListSettings = {
      rowNumber: 20,
    };
    const customLabels = {
      noOfRows: "Custom label",
    };

    // Act
    render(<TablePagination {...defaultProps} settings={settings} labels={customLabels} />);

    // Assert
    expect(screen.getByText("Custom label")).toBeInTheDocument();
  });

  it("uses history.push for navigation with href props", () => {
    // Arrange
    render(<TablePagination {...defaultProps} prevHref="/prev" nextHref="/next" />);

    // Act & Assert
    fireEvent.click(screen.getByTestId("button-pagination-next"));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/next");

    fireEvent.click(screen.getByTestId("button-pagination-back"));
    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith("/prev");
  });

  it("renders total count and total pages when totalCount is provided", () => {
    // Arrange
    const settings: ListSettings = {
      rowNumber: 20,
    };

    // Act
    render(<TablePagination {...defaultProps} settings={settings} totalCount={42} />);

    // Assert
    expect(screen.getByText("42 products · 3 pages")).toBeInTheDocument();
  });

  it("does not render total count when totalCount is not provided", () => {
    // Arrange
    render(<TablePagination {...defaultProps} />);

    // Assert
    expect(screen.queryByText(/products · .* pages/)).not.toBeInTheDocument();
  });
});
