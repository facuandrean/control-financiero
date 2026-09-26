import { BsPencil, BsArrowDown, BsArrowUp } from 'react-icons/bs';
import type { Entity } from '../../../types/entity.types';
import './entityTable.css';
import { Loading } from '../../../components/ui';

interface EntityTableProps {
  entities: Entity[];
  loading: boolean;
  onEdit: (entity: Entity) => void;
  onDeactivate: (entity: Entity) => void;
  onReactivate: (entity: Entity) => void;
  filterStatus: 'Active' | 'Inactive';
}

export const EntityTable = ({ 
  entities, 
  loading, 
  onEdit, 
  onDeactivate, 
  onReactivate,
  filterStatus
}: EntityTableProps) => {
  
  if (loading && entities.length === 0) {
    return (
      <div className="entity-loading-container">
        <Loading />
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="entity-empty-container">
        <p>No se encontraron entidades {filterStatus === 'Active' ? 'activas' : 'inactivas'}.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="entity-table">
        <thead>
          <tr>
            <th className="col-name">Nombre</th>
            <th className="col-desc">Descripción</th>
            <th className="col-status">Estado</th>
            <th className="col-actions text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity) => (
            <tr key={entity.id} className={entity.status === 'Inactive' ? 'row-inactive' : ''}>
              <td 
                className="fw-semibold truncate-text"
                title={entity.name}
              >
                {entity.name}
              </td>
              <td 
                className="text-muted truncate-text" 
                title={entity.description || ''}
              >
                {entity.description || '-'}
              </td>
              <td>
                <span className={`badge-status ${entity.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                  {entity.status === 'Active' ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  {entity.status === 'Active' && (
                    <>
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => onEdit(entity)}
                        title="Editar entidad"
                      >
                        <BsPencil />
                      </button>
                      <button 
                        className="btn-action btn-deactivate" 
                        onClick={() => onDeactivate(entity)}
                        title="Dar de baja"
                      >
                        <BsArrowDown />
                      </button>
                    </>
                  )}
                  {entity.status === 'Inactive' && (
                    <button 
                      className="btn-action btn-reactivate" 
                      onClick={() => onReactivate(entity)}
                      title="Reactivar entidad"
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
