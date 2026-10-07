import { useEffect, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { BodyContent, BodyHeader } from '../components/layout';
import { MainLayout } from '../components/layout/mainLayout/MainLayout';
import { ModalPost } from '../components/layout/modal/ModalPost';
import { ModalConfirm } from '../components/layout/modal/ModalConfirm';
import { useIsMobile } from '../hooks';
import { CategoryTable, CategoryForm, useCategories } from '../modules/categories';
import { useAuthStore } from '../store';
import { closeModal, openModal } from '../utils/modal.utils';
import type { Category } from '../types/category.types';

import './categoriesPage.css';

interface CategoriesPageProps {
  section: string;
}

export const CategoriesPage = ({ section }: CategoriesPageProps) => {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const {
    categories,
    loading,
    error,
    success,
    fetchCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
    reactivateCategory,
    clearError,
    clearSuccess,
  } = useCategories();

  const [filterStatus, setFilterStatus] = useState<'Active' | 'Inactive'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSuccessClosing, setIsSuccessClosing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = (cat.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = cat.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = async (formData: any) => {
    const isOk = await createCategory(formData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'category-modal' });
        setIsSuccessClosing(false);
      }, 1000);
    }
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!selectedCategory?.id) return;
    const isOk = await updateCategory(selectedCategory.id, formData);
    if (isOk) {
      setIsSuccessClosing(true);
      setTimeout(() => {
        closeModal({ idModal: 'category-update-modal' });
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
        title="Categorías"
        description="Gestiona las categorías para clasificar tus transacciones (ej. Sueldo, Supermercado, Ocio)."
        isMobile={isMobile}
        button={{
          label: 'Nueva categoría',
          labelLoading: 'Agregando...',
          className: 'btn-add-category',
          onClick: () => {
            clearError();
            clearSuccess();
            openModal({ idModal: 'category-modal' });
          },
          visible: true,
        }}
      />

      <BodyContent className="category-box">
        <div className="categories-controls">
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="category-search-input"
          />
          <select
            className="category-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'Active' | 'Inactive')}
          >
            <option value="Active">Activas</option>
            <option value="Inactive">Inactivas</option>
          </select>
        </div>
      </BodyContent>

      <BodyContent className="category-box table-box">
        <CategoryTable
          categories={filteredCategories}
          loading={loading && categories.length === 0}
          filterStatus={filterStatus}
          onEdit={(cat) => {
            setSelectedCategory(cat);
            clearError();
            clearSuccess();
            openModal({ idModal: 'category-update-modal' });
          }}
          onDeactivate={(cat) => {
            setSelectedCategory(cat);
            clearError();
            clearSuccess();
            openModal({ idModal: 'confirm-deactivate-category-modal' });
          }}
          onReactivate={(cat) => {
            setSelectedCategory(cat);
            clearError();
            clearSuccess();
            openModal({ idModal: 'confirm-reactivate-category-modal' });
          }}
        />
      </BodyContent>

      {/* MODAL CREAR CATEGORÍA */}
      <ModalPost
        title="Nueva Categoría"
        id="category-modal"
        formId="category-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
      >
        <CategoryForm
          onSubmit={handleCreateSubmit}
          loading={loading}
          errorMessage={error}
          successMessage={success}
          clearError={clearError}
          clearSuccess={clearSuccess}
          modalId="category-modal"
          formId="category-form"
        />
      </ModalPost>

      {/* MODAL ACTUALIZAR CATEGORÍA */}
      <ModalPost
        title="Editar Categoría"
        id="category-update-modal"
        formId="category-update-form"
        loading={loading || isSuccessClosing}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedCategory(null)}
        buttonSubmit={{
          label: 'Actualizar',
          labelLoading: 'Actualizando...',
          className: 'btn-submit-post',
          disabled: false,
          onClick: () => {},
        }}
      >
        {selectedCategory && (
          <CategoryForm
            key={selectedCategory.id}
            onSubmit={handleUpdateSubmit}
            loading={loading}
            errorMessage={error}
            successMessage={success}
            clearError={clearError}
            clearSuccess={clearSuccess}
            defaultValues={{
              name: selectedCategory.name,
              description: selectedCategory.description || '',
            }}
            modalId="category-update-modal"
            formId="category-update-form"
          />
        )}
      </ModalPost>

      {/* MODALES DE CONFIRMACIÓN */}
      <ModalConfirm
        id="confirm-deactivate-category-modal"
        title="Dar de baja categoría"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error}
        successMessage={success}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedCategory(null)}
        buttonLabel="Dar de baja"
        buttonLabelLoading="Procesando..."
        confirmButtonClass="btn btn-danger"
        onConfirm={async () => {
          if (selectedCategory?.id) {
            const ok = await deactivateCategory(selectedCategory.id);
            if (ok) {
              setIsSuccessClosing(true);
              setTimeout(() => {
                closeModal({ idModal: 'confirm-deactivate-category-modal' });
                setSelectedCategory(null);
                setIsSuccessClosing(false);
              }, 1000);
            }
          }
        }}
      >
        {selectedCategory && (
          <>
            <p>¿Estás seguro de que querés dar de baja la categoría <strong>{selectedCategory.name}</strong>?</p>
            <p className="text-muted mb-0 mt-1 d-flex align-items-center gap-3" style={{ fontSize: '0.9rem' }}>
              <BsInfoCircle size={16} />
              No podrás usarla en nuevas transacciones, pero mantendrá su historial.
            </p>
          </>
        )}
      </ModalConfirm>

      <ModalConfirm
        id="confirm-reactivate-category-modal"
        title="Reactivar categoría"
        loading={loading || isSuccessClosing}
        isProcessing={loading}
        errorMessage={error}
        successMessage={success}
        clearError={clearError}
        clearSuccess={clearSuccess}
        onHidden={() => setSelectedCategory(null)}
        buttonLabel="Reactivar"
        buttonLabelLoading="Procesando..."
        confirmButtonClass="btn btn-success"
        onConfirm={async () => {
          if (selectedCategory?.id) {
            const ok = await reactivateCategory(selectedCategory.id);
            if (ok) {
              setIsSuccessClosing(true);
              setTimeout(() => {
                closeModal({ idModal: 'confirm-reactivate-category-modal' });
                setSelectedCategory(null);
                setIsSuccessClosing(false);
              }, 1000);
            }
          }
        }}
      >
        {selectedCategory && (
          <p>¿Querés volver a activar la categoría <strong>{selectedCategory.name}</strong> para usarla nuevamente?</p>
        )}
      </ModalConfirm>
    </MainLayout>
  );
};