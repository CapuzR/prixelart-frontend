import { Box, Button } from '@material-ui/core';

export default function PaginationBar({ setPageNumber, pageNumber, itemsPerPage, maxLength }) {
  const noOfPages = Math.ceil(maxLength / itemsPerPage);
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingTop: 5,
        marginBottom: 4,
        width: '100%',
      }}
    >
      {pageNumber - 3 > 0 && (
        <Button
          style={{ minWidth: 30, marginRight: 5 }}
          onClick={() => {
            setPageNumber(1);
          }}
        >
          {1}
        </Button>
      )}
      {pageNumber - 3 > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 5,
          }}
        >
          ...
        </div>
      )}
      {pageNumber - 2 > 0 && (
        <Button
          style={{ minWidth: 30, marginRight: 5 }}
          onClick={() => {
            setPageNumber(pageNumber - 2);
          }}
        >
          {pageNumber - 2}
        </Button>
      )}
      {pageNumber - 1 > 0 && (
        <Button
          style={{ minWidth: 30, marginRight: 5 }}
          onClick={() => {
            setPageNumber(pageNumber - 1);
          }}
        >
          {pageNumber - 1}
        </Button>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          marginRight: 5,
          backgroundColor: 'rgb(238, 238, 238)',
          borderRadius: 4,
        }}
      >
        Página {pageNumber}
      </div>
      {pageNumber + 1 <= noOfPages && (
        <Button
          style={{ minWidth: 30, marginRight: 5 }}
          onClick={() => {
            setPageNumber(pageNumber + 1);
          }}
        >
          {pageNumber + 1}
        </Button>
      )}

      {pageNumber + 2 <= noOfPages && (
        <Button
          style={{ minWidth: 30, marginRight: 5 }}
          onClick={() => {
            setPageNumber(pageNumber + 2);
          }}
        >
          {pageNumber + 2}
        </Button>
      )}
      {pageNumber + 3 <= noOfPages && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 5,
          }}
        >
          ...
        </div>
      )}
      {pageNumber + 3 <= noOfPages && (
        <Button
          style={{ minWidth: 30, marginRight: 5 }}
          onClick={() => {
            setPageNumber(noOfPages);
          }}
        >
          {noOfPages}
        </Button>
      )}
    </Box>
  );
}
