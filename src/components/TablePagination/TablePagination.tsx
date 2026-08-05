import { iconSize, iconStrokeWidth } from "@dashboard/components/icons";
import useNavigator from "@dashboard/hooks/useNavigator";
import { commonMessages } from "@dashboard/intl";
import { TableCell } from "@material-ui/core";
import {
  type PaginationProps as MacawPaginationProps,
  PaginationRowNumberSelect,
  type PaginationRowNumberSelectLabels,
} from "@saleor/macaw-ui";
import { Box, Button, Text } from "@saleor/macaw-ui-next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { useIntl } from "react-intl";

import { type ListSettings } from "../../types";

export type ListSettingsUpdate = <T extends keyof ListSettings>(
  key: T,
  value: ListSettings[T],
) => void;

export interface PaginationProps
  extends Omit<
    MacawPaginationProps,
    "labels" | "rowNumber" | "nextIconButtonProps" | "prevIconButtonProps"
  > {
  component?: React.ElementType;
  colSpan?: number;
  /** Settings object (for context-based pagination) */
  settings?: ListSettings;
  /** Callback to update settings (for context-based pagination) */
  onUpdateListSettings?: ListSettingsUpdate;
  /** Direct row number value (for client-side pagination) */
  rowNumber?: number;
  /** Callback when row number changes (for client-side pagination) */
  onRowNumberChange?: (rowNumber: number) => void;
  prevHref?: string;
  nextHref?: string;
  disabled?: boolean;
  labels?: PaginationRowNumberSelectLabels;
  /** Total number of rows in the current (filtered) list, used to display total count and total pages */
  totalCount?: number;
}

const choices = [10, 20, 30, 50, 100];

export const TablePagination = ({
  component,
  colSpan,
  settings,
  onUpdateListSettings,
  rowNumber: directRowNumber,
  onRowNumberChange,
  nextHref,
  prevHref,
  hasNextPage,
  hasPreviousPage,
  disabled,
  labels,
  onNextPage,
  onPreviousPage,
  totalCount,
}: PaginationProps) => {
  const intl = useIntl();
  const navigate = useNavigator();
  const Wrapper = component || TableCell;

  const handlers = {
    onPreviousPage: prevHref ? () => navigate(prevHref) : onPreviousPage,
    onNextPage: nextHref ? () => navigate(nextHref) : onNextPage,
  };

  // Support both settings-based and direct props for row number
  const currentRowNumber = settings?.rowNumber ?? directRowNumber;
  const handleRowNumberChange = onUpdateListSettings
    ? (value: number) => onUpdateListSettings("rowNumber", value)
    : onRowNumberChange;
  const totalPages =
    totalCount != null && currentRowNumber ? Math.ceil(totalCount / currentRowNumber) : undefined;

  const content = (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      {currentRowNumber ? (
        <PaginationRowNumberSelect
          choices={choices}
          disabled={disabled}
          labels={labels || { noOfRows: intl.formatMessage(commonMessages.noOfRows) }}
          rowNumber={currentRowNumber}
          onChange={handleRowNumberChange}
        />
      ) : (
        <Box />
      )}

      {totalCount != null && totalPages != null && (
        <Text size={2}>
          {intl.formatMessage(
            {
              id: "V7s1cT",
              defaultMessage: "{count} products · {pages} pages",
              description: "pagination total count and total pages",
            },
            { count: totalCount, pages: totalPages },
          )}
        </Text>
      )}

      <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
        <Button
          variant="secondary"
          disabled={!hasPreviousPage || disabled}
          onClick={handlers.onPreviousPage}
          icon={<ChevronLeft size={iconSize.medium} strokeWidth={iconStrokeWidth} />}
          data-test-id="button-pagination-back"
        />
        <Button
          variant="secondary"
          disabled={!hasNextPage || disabled}
          onClick={handlers.onNextPage}
          icon={<ChevronRight size={iconSize.medium} strokeWidth={iconStrokeWidth} />}
          data-test-id="button-pagination-next"
        />
      </Box>
    </Box>
  );

  // If no wrapper component specified, return content directly (for use with ResponsiveTable footer)
  if (!component && !colSpan) {
    return content;
  }

  return <Wrapper colSpan={colSpan || 1000}>{content}</Wrapper>;
};

TablePagination.displayName = "TablePagination";
