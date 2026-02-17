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