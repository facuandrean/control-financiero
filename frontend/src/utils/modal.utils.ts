import { Modal } from 'bootstrap';

interface OpenModalProps {
  idModal: string;
}

export const openModal = ({ idModal }: OpenModalProps) => {
  const modalEl = document.getElementById(idModal);
  if (modalEl) {
    const modal = Modal.getOrCreateInstance(modalEl);
    modal.show();
    return;
  }

  // Fallback for cases where the modal DOM element is mounting in the current render cycle
  setTimeout(() => {
    const el = document.getElementById(idModal);
    if (el) {
      const modal = Modal.getOrCreateInstance(el);
      modal.show();
    }
  }, 0);
};

export const onModalHidden = (modalId: string, callback: () => void): (() => void) => {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return () => {};
  modalEl.addEventListener('hidden.bs.modal', callback);
  return () => modalEl.removeEventListener('hidden.bs.modal', callback);
};


interface CloseModalProps {
  idModal: string;
}

export const closeModal = ({ idModal }: CloseModalProps) => {
  const modalEl = document.getElementById(idModal);
  if (modalEl) {
    const modal = Modal.getOrCreateInstance(modalEl);
    modal.hide();
  }
};