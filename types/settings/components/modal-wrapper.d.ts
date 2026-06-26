declare module '@spyne-console/design-system/modal/modal-wrapper' {
  export interface ModalWrapperProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    allowClose?: boolean;
    ignoreOutsideClickForDropdown?: boolean;
  }

  const ModalWrapper: React.FC<ModalWrapperProps>;
  export default ModalWrapper;
}
