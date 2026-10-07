import { useEffect, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { ModalConfirm } from '../components/layout/modal/ModalConfirm';
import { Loading, Form, Input } from '../components/ui';
import { useIsMobile } from '../hooks';
import {
  DebtMetrics,
  DebtCard,
  DebtForm,
  MovementForm,
  DebtTimeline,
  useDebts,
} from '../modules/debts';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import type { Debt, DebtMovement, CreateMovementDTO } from '../types/debt.types';

import './debtsPage.css';

interface DebtsPageProps {
  section: string;
}

type FilterType = 'all' | 'Payable' | 'Receivable' | 'Settled';

export const DebtsPage = ({ section }: DebtsPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const {
    debts,
    loading,
    error,
    success,
    fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    addMovement,
    deleteMovement,
    clearError,
    clearSuccess,
  } = useDebts();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [movementModalType, setMovementModalType] = useState<'CHARGE' | 'PAYMENT'>('CHARGE');
  const [movementToDelete, setMovementToDelete] = useState<DebtMovement | null>(null);
  const [editingInitialDebt, setEditingInitialDebt] = useState<Debt | null>(null);

  const [isSuccessClosing, setIsSuccessClosing] = useState(false);
  const [isMovementDeleteClosing, setIsMovementDeleteClosing] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // Mantener selectedDebt sincronizado cuando se actualice la lista de deudas
  useEffect(() => {
    if (selectedDebt) {
      const refreshed = debts.find((d) => d.id === selectedDebt.id);
      if (refreshed) {
        setSelectedDebt(refreshed);
      }
    }
  }, [debts]);

  const filteredDebts = debts.filter((d) => {
    const matchesSearch =
      (d.entity?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isSettled = d.status === 'Settled' || (d.balance !== undefined && d.balance <= 0);

    if (activeFilter === 'all') return true;
    if (activeFilter === 'Settled') return isSettled;
    if (activeFilter === 'Payable') return d.type === 'Payable' && !isSettled;
    if (activeFilter === 'Receivable') return d.type === 'Receivable' && !isSettled;

    return true;
  });

  // UX INTELIGENTE EN NUEVA DEUDA:
  // Si ya existe una deuda abierta para esa entidad, intercepta y añade como CHARGE a su libreta
  const handleCreateSubmit = async (formData: any, existingDebtId?: string) => {
    let isOk = false;

    if (existingDebtId) {
      isOk = await addMovement(existingDebtId, {
        type: 'CHARGE',
        amount: formData.amount,
        description: formData.description || 'Nuevo cargo',
        date: formData.date,
        accountID: formData.accountID || null,
      });
    } else {
      isOk = await createDebt({
        entityID: formData.entityID,
        type: formData.type,
        initialAmount: formData.amount,
        description: formData.description,
      });
    }

    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-create-modal' });
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  const handleOpenDetails = (debt: Debt) => {
    setSelectedDebt(debt);
    clearError();
    clearSuccess();
    openModal({ idModal: 'debt-details-modal' });
  };

  const handleOpenChargeModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setMovementModalType('CHARGE');
    clearError();
    clearSuccess();
    // Cerrar modal de detalles para que no quede visible detrás
    closeModal({ idModal: 'debt-details-modal' });
    setTimeout(() => {
      openModal({ idModal: 'debt-movement-modal' });
    }, 200);
  };

  const handleOpenPaymentModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setMovementModalType('PAYMENT');
    clearError();
    clearSuccess();
    // Cerrar modal de detalles para que no quede visible detrás
    closeModal({ idModal: 'debt-details-modal' });
    setTimeout(() => {
      openModal({ idModal: 'debt-movement-modal' });
    }, 200);
  };

  const handleMovementSubmit = async (data: CreateMovementDTO) => {
    if (!selectedDebt?.id) return;
    const isOk = await addMovement(selectedDebt.id, data);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-movement-modal' });
        setIsSuccessClosing(false);
        // Re-abrir la modal de detalles con los cambios reflejados
        setTimeout(() => {
          openModal({ idModal: 'debt-details-modal' });
        }, 200);
      }, 1000);
    }
  };

  // Re-abrir modal de detalles si el usuario cierra/cancela la modal de movimiento sin enviar
  const handleMovementModalHidden = () => {
    if (!isSuccessClosing && selectedDebt && !movementToDelete) {
      setTimeout(() => {
        openModal({ idModal: 'debt-details-modal' });
      }, 150);
    }
  };

  // Eliminar movimiento usando modal de confirmación en lugar de alert
  const handleRequestDeleteMovement = (movement: DebtMovement) => {
    setMovementToDelete(movement);
    clearError();
    clearSuccess();
    closeModal({ idModal: 'debt-details-modal' });
    setTimeout(() => {
      openModal({ idModal: 'movement-delete-modal' });
    }, 200);
  };

  const handleConfirmDeleteMovement = async () => {
    if (!movementToDelete?.id) return;
    const isOk = await deleteMovement(movementToDelete.id);
    if (isOk) {
      setIsMovementDeleteClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'movement-delete-modal' });
        setMovementToDelete(null);
        setIsMovementDeleteClosing(false);
        // Re-abrir la modal de detalles con la lista actualizada
        setTimeout(() => {
          openModal({ idModal: 'debt-details-modal' });
        }, 200);
      }, 1000);
    }
  };

  const handleMovementDeleteModalHidden = () => {
    if (!isMovementDeleteClosing && selectedDebt) {
      setMovementToDelete(null);
      setTimeout(() => {
        openModal({ idModal: 'debt-details-modal' });
      }, 150);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDebt?.id) return;
    const isOk = await deleteDebt(selectedDebt.id);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-delete-modal' });
        closeModal({ idModal: 'debt-details-modal' });
        setSelectedDebt(null);
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  const handleOpenEditInitialAmount = (debt: Debt) => {
    setEditingInitialDebt(debt);
    clearError();
    clearSuccess();
    closeModal({ idModal: 'debt-details-modal' });
    setTimeout(() => {
      openModal({ idModal: 'debt-edit-initial-modal' });
    }, 200);
  };

  const handleUpdateInitialSubmit = async (formData: { initialAmount: any }) => {
    if (!editingInitialDebt?.id) return;
    const isOk = await updateDebt(editingInitialDebt.id, {
      initialAmount: Number(formData.initialAmount),
    });
    if (isOk) {
      setIsSuccessClosing(true);
      await fetchDebts();
      setTimeout(() => {
        closeModal({ idModal: 'debt-edit-initial-modal' });
        setIsSuccessClosing(false);
        if (selectedDebt?.id === editingInitialDebt.id) {
          setTimeout(() => {
            openModal({ idModal: 'debt-details-modal' });
          }, 200);
        }
        setEditingInitialDebt(null);
      }, 1000);
    }
  };

  const handleEditInitialModalHidden = () => {
    if (!isSuccessClosing && selectedDebt && editingInitialDebt) {
      setEditingInitialDebt(null);
      setTimeout(() => {
        openModal({ idModal: 'debt-details-modal' });
      }, 150);
    } else {
      setEditingInitialDebt(null);
    }
  };

  return (
    <MainLayout
      section={section}
      username={user?.name || 'Usuario'}
      email={user?.email || ''}
    >
      <BodyHeader
        title="Deudas y Cobros"
        description="Gestiona tus compromisos de pago y cuentas por cobrar con un sistema de cuenta corriente y línea de tiempo."
        isMobile={isMobile}
        button={{
          label: 'Nueva deuda',
          labelLoading: 'Agregando...',
          className: 'btn-add-debt',
          onClick: () => {
            clearError();
            clearSuccess();
            openModal({ idModal: 'debt-create-modal' });
          },
          visible: true,
        }}
      />

      <div className="debts-page-container">
        {/* MÉTRICAS FINANCIERAS */}
        <DebtMetrics debts={debts} />

        {/* CONTROLES Y FILTROS */}
        <BodyContent className="debts-controls-box">
          <div className="debts-filters">
            <div className="debts-filter-buttons">
              <button
                type="button"
                className={`btn-filter-tag ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Todas
              </button>
              <button
                type="button"
                className={`btn-filter-tag ${activeFilter === 'Payable' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Payable')}
              >
                Debo
              </button>
              <button
                type="button"
                className={`btn-filter-tag ${activeFilter === 'Receivable' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Receivable')}
              >
                Me Deben
              </button>
              <button
                type="button"
                className={`btn-filter-tag ${activeFilter === 'Settled' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Settled')}
              >
                Saldadas
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar por persona o entidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="debts-search-input"
            />
          </div>
        </BodyContent>

        {/* GRILLA DE TARJETAS */}
        {loading && debts.length === 0 ? (
          <div className="debts-loading-state">
            <Loading />
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="debts-empty-state">
            <p>No se encontraron cuentas de deuda con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="debts-grid">
            {filteredDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onSelectDebt={handleOpenDetails}
                onEdit={handleOpenEditInitialAmount}
                onDelete={(d) => {
                  setSelectedDebt(d);
                  clearError();
                  clearSuccess();
                  openModal({ idModal: 'debt-delete-modal' });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR DEUDA (CON UX INTELIGENTE) */}
      <ModalPost
        title="Nueva Deuda o Cuenta por Cobrar"
        id="debt-create-modal"
        formId="debt-create-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
      >
        <DebtForm
          debts={debts}
          onSubmit={handleCreateSubmit}
          loading={loading}
          errorMessage={error}
          successMessage={success}
          clearError={clearError}
          clearSuccess={clearSuccess}
          modalId="debt-create-modal"
          formId="debt-create-form"
        />
      </ModalPost>

      {/* MODAL DETALLES: LÍNEA DE TIEMPO (TIMELINE) */}
      <ModalPost
        title={
          selectedDebt
            ? `Libreta: ${selectedDebt.entity?.name || 'Cuenta Corriente'}`
            : 'Detalles de la Libreta'
        }
        id="debt-details-modal"
        loading={loading}
        clearError={clearError}
        clearSuccess={clearSuccess}
        customFooter={
          <div className="w-100 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
          </div>
        }
      >
        {selectedDebt && (
          <DebtTimeline
            key={selectedDebt.id}
            debt={selectedDebt}
            onRequestDeleteMovement={handleRequestDeleteMovement}
            onOpenChargeModal={handleOpenChargeModal}
            onOpenPaymentModal={handleOpenPaymentModal}
            onEditInitialAmount={handleOpenEditInitialAmount}
          />
        )}
      </ModalPost>

      {/* MODAL REGISTRAR MOVIMIENTO (CARGO O PAGO) */}
      <ModalPost
        title={
          movementModalType === 'CHARGE'
            ? 'Añadir Nuevo Cargo'
            : 'Registrar Pago de Deuda'
        }
        id="debt-movement-modal"
        formId="debt-movement-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={handleMovementModalHidden}
        buttonSubmit={{
          label: movementModalType === 'CHARGE' ? 'Añadir Cargo' : 'Registrar Pago',
          labelLoading: 'Guardando...',
          className:
            movementModalType === 'CHARGE'
              ? 'btn-timeline-action btn-timeline-charge'
              : 'btn-timeline-action btn-timeline-payment',
          disabled: false,
          onClick: () => {},
        }}
      >
        {selectedDebt && (
          <MovementForm
            key={`${selectedDebt.id}-${movementModalType}`}
            debt={selectedDebt}
            type={movementModalType}
            onSubmit={handleMovementSubmit}
            loading={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            modalId="debt-movement-modal"
            formId="debt-movement-form"
          />
        )}
      </ModalPost>

      {/* MODAL CONFIRMAR ELIMINACIÓN DE UN MOVIMIENTO */}
      <ModalConfirm
        id="movement-delete-modal"
        title="Eliminar Movimiento"
        loading={loading || isMovementDeleteClosing}
        isProcessing={loading}
        errorMessage={error || undefined}
        successMessage={success || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={handleMovementDeleteModalHidden}
        buttonLabel="Eliminar Movimiento"
        buttonLabelLoading="Eliminando..."
        confirmButtonClass="btn btn-danger"
        onConfirm={handleConfirmDeleteMovement}
      >
        {movementToDelete && (
          <>
            <p>
              ¿Estás seguro de que querés eliminar el movimiento{' '}
              <strong>"{movementToDelete.description}"</strong> de{' '}
              <strong>${movementToDelete.amount}</strong>?
            </p>
            <p
              className="text-muted mb-0 mt-1 d-flex align-items-center gap-2"
              style={{ fontSize: '0.85rem' }}
            >
              <BsInfoCircle size={16} className="flex-shrink-0" />
              Si este movimiento afectó una cuenta bancaria, se revertirá su saldo automáticamente.
            </p>
          </>
        )}
      </ModalConfirm>

      {/* MODAL CONFIRMAR ELIMINACIÓN DE CUENTA DE DEUDA COMPLETA */}
      <ModalConfirm
        id="debt-delete-modal"
        title="Eliminar Cuenta de Deuda"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error || undefined}
        successMessage={success || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedDebt(null)}
        buttonLabel="Eliminar Cuenta"
        buttonLabelLoading="Eliminando..."
        confirmButtonClass="btn btn-danger"
        onConfirm={handleDeleteConfirm}
      >
        {selectedDebt && (
          <>
            <p>
              ¿Estás seguro de que querés eliminar la cuenta vinculada a{' '}
              <strong>{selectedDebt.entity?.name || 'la entidad'}</strong>?
            </p>
            <p
              className="text-muted mb-0 mt-1 d-flex align-items-center gap-3"
              style={{ fontSize: '0.9rem' }}
            >
              <BsInfoCircle size={16} />
              Esta acción eliminará la cuenta y toda su línea de tiempo de movimientos, revirtiendo las transacciones bancarias asociadas.
            </p>
          </>
        )}
      </ModalConfirm>

      {/* MODAL EDITAR MONTO INICIAL DE DEUDA */}
      <ModalPost
        title="Corregir Monto Inicial de Deuda"
        id="debt-edit-initial-modal"
        formId="debt-edit-initial-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={handleEditInitialModalHidden}
        buttonSubmit={{
          label: 'Guardar Monto',
          labelLoading: 'Guardando...',
          className: 'btn-submit-post',
          disabled: false,
          onClick: () => {},
        }}
      >
        {editingInitialDebt && (
          <Form
            formId="debt-edit-initial-form"
            onSubmit={handleUpdateInitialSubmit}
            loading={loading}
            errorMessage={error || undefined}
            successMessage={success || undefined}
            clearError={clearError}
            clearSuccess={clearSuccess}
            modalId="debt-edit-initial-modal"
            defaultValues={{
              initialAmount: editingInitialDebt.initialAmount ?? 0,
            }}
          >
            {({ control, errors }) => (
              <>
                <div
                  className="mb-3 p-3 rounded"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                  }}
                >
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Entidad / Persona:</span>
                    <strong className="text-dark">
                      {editingInitialDebt.entity?.name || 'Entidad'}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Tipo de libreta:</span>
                    <span
                      className="fw-semibold"
                      style={{
                        color:
                          editingInitialDebt.type === 'Payable'
                            ? '#c46262'
                            : '#4c9767',
                      }}
                    >
                      {editingInitialDebt.type === 'Payable'
                        ? 'Debo (Pago)'
                        : 'Me deben (Cobro)'}
                    </span>
                  </div>
                </div>

                <Input
                  formID="debt-edit-initial-form"
                  name="initialAmount"
                  label="Monto Inicial de la Deuda"
                  placeholder="Ej: 50000"
                  type="number"
                  control={control}
                  rules={{
                    required: 'El monto es obligatorio',
                    min: { value: 0, message: 'El monto debe ser 0 o mayor' },
                    valueAsNumber: true,
                  }}
                  errors={errors}
                />

                <p
                  className="text-muted mt-2 d-flex align-items-center gap-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  <BsInfoCircle size={15} className="flex-shrink-0" />
                  Al actualizar el monto inicial, el saldo restante y el estado de la deuda se recalcularán automáticamente con todos sus movimientos existentes.
                </p>
              </>
            )}
          </Form>
        )}
      </ModalPost>
    </MainLayout>
  );
};