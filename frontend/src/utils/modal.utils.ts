import { Modal } from 'bootstrap';

interface OpenModalProps {
  idModal: string;
}

export const openModal = ({ idModal }: OpenModalProps) => {
  const modalEl = document.getElementById(idModal);
  if (modalEl) {
    const modal = Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

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