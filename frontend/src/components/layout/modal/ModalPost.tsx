import { useEffect } from 'react';
import { onModalHidden } from '../../../utils/modal.utils';
import './modal-post.css';

interface ModalPostProps {
  id: string;
  title: string;
  formId?: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onHidden?: () => void;
  clearError?: () => void;
  clearSuccess?: () => void;
  customFooter?: React.ReactNode;
  buttonSubmit?: {
    label: string;
    labelLoading: string;
    className: string;
    disabled: boolean;
    onClick: () => void;
  };
}

export const ModalPost = ({ 
  id, 
  title, 
  formId, 
  loading = false, 
  children, 
  className = "",
  onHidden,
  clearError,
  clearSuccess,
  customFooter,
  buttonSubmit = {
    label: "Registrar",
    labelLoading: "Registrando...",
    className: "btn-submit-post",
    disabled: false,
    onClick: () => {},
  }
}: ModalPostProps) => {
  useEffect(() => {
    return onModalHidden(id, () => {
      clearError?.();
      clearSuccess?.();
      onHidden?.();
    });
  }, [id, clearError, clearSuccess, onHidden]);
  return (
    <>
      <div className="modal fade" id={id} aria-hidden="true" aria-labelledby={`${id}Label`} tabIndex={-1}>
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${className}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {children}
            </div>
            <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
              {customFooter ? (
                customFooter
              ) : (
                <>
                  <button type="button" className="btn btn-outline-secondary" disabled={loading} data-bs-dismiss="modal">
                    Cancelar
                  </button>
                  {formId && (
                    <button 
                      type="submit" 
                      form={formId} 
                      className={`${buttonSubmit.className}`} 
                      disabled={loading || buttonSubmit.disabled} 
                      onClick={buttonSubmit.onClick}
                    >
                      {loading ? buttonSubmit.labelLoading : buttonSubmit.label}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}