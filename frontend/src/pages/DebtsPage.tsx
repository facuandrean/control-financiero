import { useEffect, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { ModalConfirm } from '../components/layout/modal/ModalConfirm';
import { Loading } from '../components/ui';
import { useIsMobile } from '../hooks';
import {
  DebtMetrics,
  DebtCard,
  DebtForm,
  PaymentForm,
  useDebts,
} from '../modules/debts';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import type { Debt } from '../types/debt.types';

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
    addPayment,
    clearError,
    clearSuccess,
  } = useDebts();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const filteredDebts = debts.filter((d) => {
    const matchesSearch =
      (d.entity?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'Settled') return d.status === 'Settled';
    if (activeFilter === 'Payable') return d.type === 'Payable' && d.status !== 'Settled';
    if (activeFilter === 'Receivable') return d.type === 'Receivable' && d.status !== 'Settled';

    return true;
  });

  const handleCreateSubmit = async (formData: any) => {
    const isOk = await createDebt(formData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-create-modal' });
        setIsSuccessClosing(false);
      }, 3000);
    }
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!selectedDebt?.id) return;
    const isOk = await updateDebt(selectedDebt.id, formData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-update-modal' });
        setSelectedDebt(null);
        setIsSuccessClosing(false);
      }, 3000);
    }
  };

  const handlePaymentSubmit = async (formData: any) => {
    if (!selectedDebt?.id) return;
    const isOk = await addPayment(
      selectedDebt.id,
      formData.amount,
      formData.date,
      formData.notes
    );
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-payment-modal' });
        setSelectedDebt(null);
        setIsSuccessClosing(false);
      }, 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDebt?.id) return;
    const isOk = await deleteDebt(selectedDebt.id);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'debt-delete-modal' });
        setSelectedDebt(null);
        setIsSuccessClosing(false);
      }, 3000);
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
        description="Gestiona tus compromisos de pago y cuentas por cobrar con seguimiento de pagos parciales."
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
              placeholder="Buscar por entidad o motivo..."
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
            <p>No se encontraron registros con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="debts-grid">
            {filteredDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onAddPayment={(d) => {
                  setSelectedDebt(d);
                  clearError();
                  clearSuccess();
                  openModal({ idModal: 'debt-payment-modal' });
                }}
                onEdit={(d) => {
                  setSelectedDebt(d);
                  clearError();
                  clearSuccess();
                  openModal({ idModal: 'debt-update-modal' });
                }}
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

      {/* MODAL CREAR DEUDA */}
      <ModalPost
        title="Nueva Deuda o Cuenta por Cobrar"
        id="debt-create-modal"
        formId="debt-create-form"
        loading={loading || isSuccessClosing}
      >
        <DebtForm
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

      {/* MODAL EDITAR DEUDA */}
      <ModalPost
        title="Editar Deuda"
        id="debt-update-modal"
        formId="debt-update-form"
        loading={loading || isSuccessClosing}
        buttonSubmit={{
          label: 'Actualizar',
          labelLoading: 'Actualizando...',
          className: 'btn-submit-post',
          disabled: false,
          onClick: () => {},
        }}
      >
        {selectedDebt && (
          <DebtForm
            key={selectedDebt.id}
            onSubmit={handleUpdateSubmit}
            loading={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            defaultValues={{
              entityID: selectedDebt.entityID,
              type: selectedDebt.type,
              description: selectedDebt.description,
              totalAmount: selectedDebt.totalAmount,
              dueDate: selectedDebt.dueDate || '',
            }}
            modalId="debt-update-modal"
            formId="debt-update-form"
          />
        )}
      </ModalPost>

      {/* MODAL REGISTRAR PAGO */}
      <ModalPost
        title="Registrar Pago"
        id="debt-payment-modal"
        formId="debt-payment-form"
        loading={loading || isSuccessClosing}
        buttonSubmit={{
          label: 'Registrar',
          labelLoading: 'Registrando...',
          className: 'btn-submit-post',
          disabled: false,
          onClick: () => {},
        }}
      >
        {selectedDebt && (
          <PaymentForm
            key={selectedDebt.id}
            debt={selectedDebt}
            onSubmit={handlePaymentSubmit}
            loading={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            modalId="debt-payment-modal"
            formId="debt-payment-form"
          />
        )}
      </ModalPost>

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      <ModalConfirm
        id="debt-delete-modal"
        title="Eliminar Deuda"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error || undefined}
        successMessage={success || undefined}
        clearError={clearError}
        clearSuccess={clearSuccess}
        buttonLabel="Eliminar"
        buttonLabelLoading="Eliminando..."
        confirmButtonClass="btn btn-danger"
        onConfirm={handleDeleteConfirm}
      >
        {selectedDebt && (
          <>
            <p>
              ¿Estás seguro de que querés eliminar la deuda vinculada a{' '}
              <strong>{selectedDebt.entity?.name || 'la entidad'}</strong>?
            </p>
            <p
              className="text-muted mb-0 mt-1 d-flex align-items-center gap-3"
              style={{ fontSize: '0.9rem' }}
            >
              <BsInfoCircle size={16} />
              Esta acción eliminará permanentemente la deuda y su historial de pagos.
            </p>
          </>
        )}
      </ModalConfirm>
    </MainLayout>
  );
};