import './modal-update.css';

interface ModalUpdateProps {
  id: string;
  title: string;
  formId: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  buttonLabel?: string;
  buttonLabelLoading?: string;
}

export const ModalUpdate = ({
  id,
  title,
  formId,
  loading = false,
  children,
  className = "",
  disabled = false,
  buttonLabel = "Guardar cambios",
  buttonLabelLoading = "Guardando cambios...",
}: ModalUpdateProps) => {
  return (
    <>
      <div className="modal fade" id={id} aria-hidden="true" aria-labelledby={`${id}Label`} tabIndex={-1}>
        <div className={`modal-dialog modal-dialog-centered ${className}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`${id}Label`}>{title}</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {children}
            </div>
            <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary" disabled={loading || disabled} data-bs-dismiss="modal">
                Cancelar
              </button>
              <button
                type="submit"
                form={formId}
                className="btn btn-success"
                disabled={loading || disabled}
              >
                {loading ? buttonLabelLoading : buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}