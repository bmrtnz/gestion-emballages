import { Injectable } from '@nestjs/common';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable()
export class PaginationService {
  createPaginatedResponse<T>(data: T[], total: number, options: PaginationOptions): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / options.limit);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
      hasNextPage: options.page < totalPages,
      hasPreviousPage: options.page > 1,
    };
  }

  getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  validatePaginationOptions(options: PaginationOptions): PaginationOptions {
    return {
      page: Math.max(1, options.page || 1),
      limit: Math.min(100, Math.max(1, options.limit || 10)),
      sortBy: options.sortBy || 'createdAt',
      sortOrder: options.sortOrder || 'DESC',
    };
  }

  async paginate<T>(
    queryBuilder: {
      skip(skip: number): any;
      take(limit: number): any;
      getManyAndCount(): Promise<[T[], number]>;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<T>> {
    const skip = this.getSkip(page, limit);

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return this.createPaginatedResponse(data, total, { page, limit });
  }
}
