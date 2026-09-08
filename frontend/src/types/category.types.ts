export interface Category {
  id?: string;
  name: string;
  description?: string | null;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
}
