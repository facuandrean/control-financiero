import { useEffect, useRef } from 'react';
import { Loading } from '../../ui/loading/Loading';
import { MessageError } from '../../ui/messages/MessageError';
import { MessageSuccess } from '../../ui/messages/MessageSuccess';
import './modal-delete.css';
import { useClear } from '../../../hooks';
import { onModalHidden } from '../../../utils/modal.utils';

interface ModalConfirmProps {
  id: string;
  title: string;
  loading?: boolean;
  isProcessing?: boolean;
  children: React.ReactNode;
  className?: string;
  buttonLabel?: string;
  buttonLabelLoading?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  errorMessage?: string | null;
  successMessage?: string | null;
  clearError?: () => void;
  clearSuccess?: () => void;
  onHidden?: () => void;
}
export const ModalConfirm = ({ 
  id, 
  title, 
  loading = false, 
  isProcessing = false,
  children, 
  className = "", 
  buttonLabel = "Confirmar", 
  buttonLabelLoading = "Confirmando...",
  confirmButtonClass = "btn btn-danger",
  onConfirm,
  errorMessage,
  successMessage,
  clearError,
  clearSuccess,
  onHidden
}: ModalConfirmProps) => {

  useClear({ message: errorMessage, clearMessage: clearError ?? (() => {}) });
  useClear({ message: successMessage, clearMessage: clearSuccess ?? (() => {}) });

  const callbacksRef = useRef({ clearError, clearSuccess, onHidden });
  useEffect(() => {
    callbacksRef.current = { clearError, clearSuccess, onHidden };
  });

  useEffect(() => {
    return onModalHidden(id, () => {
      callbacksRef.current.clearError?.();
      callbacksRef.current.clearSuccess?.();
      callbacksRef.current.onHidden?.();
    });
  }, [id]);

  return (
    <>
      <div className="modal fade" id={id} aria-hidden="true" aria-labelledby={`${id}Label`} tabIndex={-1}>
        <div className={`modal-dialog modal-dialog-centered ${className}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {children}
              
              {isProcessing && (
                <div className="d-flex justify-content-center mt-3">
                  <Loading />
                </div>
              )}

              {successMessage && !isProcessing && (
                <MessageSuccess message={successMessage} className="mt-3" />
              )}
              {errorMessage && !isProcessing && (
                <MessageError message={errorMessage} className="mt-3" />
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading}>
                Cancelar
              </button>
              <button
                type="button"
                className={confirmButtonClass}
                disabled={loading}
                onClick={onConfirm}
              >
                {loading ? buttonLabelLoading : buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
