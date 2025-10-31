import { Box, Button } from "@mui/material";
import { JSX, useMemo } from "react";

interface PaginationBarProps {
  setPageNumber: (page: number) => void;
  pageNumber: number;
  itemsPerPage: number;
  maxLength: number;
}

export default function PaginationBar({
  setPageNumber,
  pageNumber,
  itemsPerPage,
  maxLength,
}: PaginationBarProps): JSX.Element | null {
  const noOfPages = Math.ceil(maxLength / itemsPerPage);
  if (noOfPages <= 1) return null;

  // Determine the pages to display around the current page.
  const pagesToShow = useMemo(() => {
    const pages = [];
    // Calculate the start and end page numbers for pagination
    const start = Math.max(pageNumber - 2, 1);
    const end = Math.min(pageNumber + 2, noOfPages);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [pageNumber, noOfPages]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignSelf: "center",
        pt: 1,
        mb: 2,
        width: "100%",
      }}
    >
      {pageNumber > 3 && (
        <>
          <Button sx={{ minWidth: 30, mr: 1 }} onClick={() => setPageNumber(1)}>
            1
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>...</Box>
        </>
      )}

      {pagesToShow.map((page) =>
        page === pageNumber ? (
          <Box
            key={page}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 80,
              mr: 1,
              bgcolor: "rgb(238, 238, 238)",
              borderRadius: 1,
            }}
          >
            Página {page}
          </Box>
        ) : (
          <Button
            key={page}
            sx={{ minWidth: 30, mr: 1 }}
            onClick={() => setPageNumber(page)}
          >
            {page}
          </Button>
        ),
      )}

      {pageNumber < noOfPages - 2 && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>...</Box>
          <Button
            sx={{ minWidth: 30, mr: 1 }}
            onClick={() => setPageNumber(noOfPages)}
          >
            {noOfPages}
          </Button>
        </>
      )}
    </Box>
  );
}
