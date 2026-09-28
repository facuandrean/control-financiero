import { BsPencil, BsArrowDown, BsArrowUp } from 'react-icons/bs';
import type { Category } from '../../../types/category.types';
import './categoryTable.css';
import { Loading } from '../../../components/ui';

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => void;
  onReactivate: (category: Category) => void;
  filterStatus: 'Active' | 'Inactive';
}

export const CategoryTable = ({ 
  categories, 
  loading, 
  onEdit, 
  onDeactivate, 
  onReactivate,
  filterStatus
}: CategoryTableProps) => {
  
  if (loading && categories.length === 0) {
    return (
      <div className="category-loading-container">
        <Loading />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="category-empty-container">
        <p>No se encontraron categorías {filterStatus === 'Active' ? 'activas' : 'inactivas'}.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="category-table">
        <thead>
          <tr>
            <th className="col-name">Nombre</th>
            <th className="col-desc">Descripción</th>
            <th className="col-status">Estado</th>
            <th className="col-actions text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className={category.status === 'Inactive' ? 'row-inactive' : ''}>
              <td 
                className="fw-semibold truncate-text"
                title={category.name}
              >
                {category.name}
              </td>
              <td 
                className="text-muted truncate-text" 
                title={category.description || ''}
              >
                {category.description || '-'}
              </td>
              <td>
                <span className={`badge-status ${category.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                  {category.status === 'Active' ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  {category.status === 'Active' && (
                    <>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => onEdit(category)}
                        title="Editar categoría"
                      >
                        <BsPencil />
                      </button>
                      <button 
                        className="btn-action btn-deactivate" 
                        onClick={() => onDeactivate(category)}
                        title="Dar de baja"
                      >
                        <BsArrowDown />
                      </button>
                    </>
                  )}
                  {category.status === 'Inactive' && (
                    <button 
                      className="btn-action btn-reactivate" 
                      onClick={() => onReactivate(category)}
                      title="Reactivar categoría"
                    >
                      <BsArrowUp />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
