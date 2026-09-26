export interface Entity {
  id?: string;
  name: string;
  description?: string | null;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEntityDTO {
  name: string;
  description?: string;
}

export interface UpdateEntityDTO {
  name?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
}
