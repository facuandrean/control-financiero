import './modal-delete.css';

interface ModalConfirmProps {
  id: string;
  title: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  buttonLabel?: string;
  buttonLabelLoading?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
}
export const ModalConfirm = ({ 
  id, 
  title, 
  loading = false, 
  children, 
  className = "", 
  buttonLabel = "Confirmar", 
  buttonLabelLoading = "Confirmando...",
  confirmButtonClass = "btn btn-danger",
  onConfirm
}: ModalConfirmProps) => {
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
