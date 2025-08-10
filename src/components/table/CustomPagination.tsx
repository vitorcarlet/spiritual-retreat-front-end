import * as React from "react";
import {
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageCountSelector,
  gridPageSizeSelector,
  gridRowCountSelector,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Popover,
  MenuList,
  MenuItem,
} from "@mui/material";
import Iconify from "../Iconify";

type CustomPaginationProps = {
  pageSizeOptions?: number[];
  labelRowsPerPage?: string;
  className?: string;
};

export default function CustomPagination({
  pageSizeOptions = [10, 25, 50, 100],
  labelRowsPerPage = "Itens por página",
  className,
}: CustomPaginationProps) {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowCount = useGridSelector(apiRef, gridRowCountSelector);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePrev = () => {
    if (page > 0) apiRef.current.setPage(page - 1);
  };
  const handleNext = () => {
    if (page < pageCount - 1) apiRef.current.setPage(page + 1);
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleSelectPageSize = (size: number) => {
    if (size === pageSize) {
      handleClose();
      return;
    }
    apiRef.current.setPageSize(size);
    apiRef.current.setPage(0);
    handleClose();
  };

  const from = rowCount === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(rowCount, (page + 1) * pageSize);

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="flex-end"
      className={className}
      sx={{ width: "100%", p: 1 }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {labelRowsPerPage}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleOpen}
          endIcon={<Iconify icon="mdi:chevron-down" />}
        >
          {pageSize}
        </Button>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          PaperProps={{ sx: { minWidth: 140 } }}
        >
          <MenuList dense disablePadding>
            {pageSizeOptions.map((opt) => (
              <MenuItem
                key={opt}
                selected={opt === pageSize}
                onClick={() => handleSelectPageSize(opt)}
              >
                {opt}
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
      </Stack>

      <Box sx={{ flex: 1 }} />

      <Typography variant="body2" color="text.secondary">
        {from}-{to} de {rowCount}
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <IconButton
          size="small"
          onClick={handlePrev}
          disabled={page <= 0 || pageCount === 0}
        >
          <Iconify icon="mdi:chevron-left" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleNext}
          disabled={page >= pageCount - 1 || pageCount === 0}
        >
          <Iconify icon="mdi:chevron-right" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
