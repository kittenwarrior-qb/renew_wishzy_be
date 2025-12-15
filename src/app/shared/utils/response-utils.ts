export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    totalPage: number;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  };
  statistics?: any; // Optional statistics field for instructor endpoints
}
