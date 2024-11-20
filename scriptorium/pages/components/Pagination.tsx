// GENERATED WITH CHATGPT

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const range = 3; // Number of pages before and after the current page to display
    const pageNumbers = [];

    // Handle for the beginning of the pages
    for (let i = 1; i <= totalPages; i++) {
      if (i <= range || i > totalPages - range || (i >= currentPage - range && i <= currentPage + range)) {
        pageNumbers.push(i);
      }
    }

    // Add ellipsis if necessary
    if (pageNumbers[0] > 1) pageNumbers.unshift('...');
    if (pageNumbers[pageNumbers.length - 1] < totalPages) pageNumbers.push('...');

    return pageNumbers;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md ${
          currentPage === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Previous
      </button>

      {/* Display page numbers with ellipsis */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => handlePageChange(typeof page === 'number' ? page : currentPage)}
          className={`px-4 py-2 rounded-md ${
            page === currentPage
              ? "bg-blue-600 text-white font-bold"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
