declare module 'bootstrap' {
  export class Modal {
    static getOrCreateInstance(element: HTMLElement | null): Modal;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }
}
