import { useEffect, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { ModalConfirm } from '../components/layout/modal/ModalConfirm';
import { useIsMobile } from '../hooks';
import { EntityTable, EntityForm, useEntities } from '../modules/entities';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import type { Entity } from '../types/entity.types';

import './entitiesPage.css';

interface EntitiesPageProps {
  section: string;
}

export const EntitiesPage = ({ section }: EntitiesPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const {
    entities,
    loading,
    error,
    success,
    fetchEntities,
    createEntity,
    updateEntity,
    deactivateEntity,
    reactivateEntity,
    clearError,
    clearSuccess,
  } = useEntities();

  const [filterStatus, setFilterStatus] = useState<'Active' | 'Inactive'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const filteredEntities = entities.filter((ent) => {
    const matchesSearch = (ent.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = ent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = async (formData: any) => {
    const isOk = await createEntity(formData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'entity-modal' });
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!selectedEntity?.id) return;
    const isOk = await updateEntity(selectedEntity.id, formData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'entity-update-modal' });
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  return (
    <MainLayout
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || ''}
    >
      <BodyHeader
        title="Entidades"
        description="Gestiona los comercios, empresas o personas involucradas en tus transacciones (ej. Coto, Netflix, Juan Pérez)."
        isMobile={isMobile}
        button={{
          label: 'Nueva entidad',
          labelLoading: 'Agregando...',
          className: 'btn-add-entity',
          onClick: () => {
            clearError();
            clearSuccess();
            openModal({ idModal: 'entity-modal' });
          },
          visible: true,
        }}
      />

      <BodyContent className="entity-box">
        <div className="entities-controls">
          <input
            type="text"
            placeholder="Buscar entidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="entity-search-input"
          />
          <select
            className="entity-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'Active' | 'Inactive')}
          >
            <option value="Active">Activas</option>
            <option value="Inactive">Inactivas</option>
          </select>
        </div>
      </BodyContent>

      <BodyContent className="entity-box table-box">
        <EntityTable
          entities={filteredEntities}
          loading={loading && entities.length === 0}
          filterStatus={filterStatus}
          onEdit={(ent) => {
            setSelectedEntity(ent);
            clearError();
            clearSuccess();
            openModal({ idModal: 'entity-update-modal' });
          }}
          onDeactivate={(ent) => {
            setSelectedEntity(ent);
            clearError();
            clearSuccess();
            openModal({ idModal: 'confirm-deactivate-entity-modal' });
          }}
          onReactivate={(ent) => {
            setSelectedEntity(ent);
            clearError();
            clearSuccess();
            openModal({ idModal: 'confirm-reactivate-entity-modal' });
          }}
        />
      </BodyContent>

      {/* MODAL CREAR ENTIDAD */}
      <ModalPost
        title="Nueva Entidad"
        id="entity-modal"
        formId="entity-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
      >
        <EntityForm
          onSubmit={handleCreateSubmit}
          loading={loading}
          errorMessage={error}
          successMessage={success}
          clearError={clearError}
          clearSuccess={clearSuccess}
          modalId="entity-modal"
          formId="entity-form"
        />
      </ModalPost>

      {/* MODAL ACTUALIZAR ENTIDAD */}
      <ModalPost
        title="Editar Entidad"
        id="entity-update-modal"
        formId="entity-update-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedEntity(null)}
        buttonSubmit={{
          label: 'Actualizar',
          labelLoading: 'Actualizando...',
          className: 'btn-submit-post',
          disabled: false,
          onClick: () => {},
        }}
      >
        {selectedEntity && (
          <EntityForm
            key={selectedEntity.id}
            onSubmit={handleUpdateSubmit}
            loading={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            defaultValues={{
              name: selectedEntity.name,
              description: selectedEntity.description || '',
            }}
            modalId="entity-update-modal"
            formId="entity-update-form"
          />
        )}
      </ModalPost>

      {/* MODALES DE CONFIRMACIÓN */}
      <ModalConfirm
        id="confirm-deactivate-entity-modal"
        title="Dar de baja entidad"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error || undefined}
        successMessage={success || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedEntity(null)}
        buttonLabel="Dar de baja"
        buttonLabelLoading="Procesando..."
        confirmButtonClass="btn btn-danger"
        onConfirm={async () => {
          if (selectedEntity?.id) {
            const ok = await deactivateEntity(selectedEntity.id);
            if (ok) {
              setIsSuccessClosing(true);
              setTimeout(() => {
                closeModal({ idModal: 'confirm-deactivate-entity-modal' });
                setSelectedEntity(null);
                setIsSuccessClosing(false);
              }, 1000);
            }
          }
        }}
      >
        {selectedEntity && (
          <>
            <p>¿Estás seguro de que querés dar de baja la entidad <strong>{selectedEntity.name}</strong>?</p>
            <p className="text-muted mb-0 mt-1 d-flex align-items-center gap-3" style={{ fontSize: '0.9rem' }}>
              <BsInfoCircle size={16} />
              No podrás usarla en nuevas transacciones, pero mantendrá su historial.
            </p>
          </>
        )}
      </ModalConfirm>

      <ModalConfirm
        id="confirm-reactivate-entity-modal"
        title="Reactivar entidad"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error || undefined}
        successMessage={success || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedEntity(null)}
        buttonLabel="Reactivar"
        buttonLabelLoading="Procesando..."
        confirmButtonClass="btn btn-success"
        onConfirm={async () => {
          if (selectedEntity?.id) {
            const ok = await reactivateEntity(selectedEntity.id);
            if (ok) {
              setIsSuccessClosing(true);
              setTimeout(() => {
                closeModal({ idModal: 'confirm-reactivate-entity-modal' });
                setSelectedEntity(null);
                setIsSuccessClosing(false);
              }, 1000);
            }
          }
        }}
      >
        {selectedEntity && (
          <p>¿Querés volver a activar la entidad <strong>{selectedEntity.name}</strong> para usarla nuevamente?</p>
        )}
      </ModalConfirm>
    </MainLayout>
  );
};