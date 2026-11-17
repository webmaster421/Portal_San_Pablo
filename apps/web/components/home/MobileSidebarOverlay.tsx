interface MobileSidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebarOverlay({
  isOpen,
  onClose,
}: MobileSidebarOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm ${isOpen ? "block" : "hidden"} lg:hidden`}
      onClick={onClose}
    ></div>
  );
}