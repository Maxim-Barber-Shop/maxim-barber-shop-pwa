export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type SortParams = {
  column: string;
  ascending?: boolean;
};
