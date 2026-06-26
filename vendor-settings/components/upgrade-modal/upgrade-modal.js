import BookAMeeting from '../calendar/BookAMeeting';

const UpgradeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="mx-auto w-full scale-[0.9] rounded-lg bg-transparent md:w-[80%]">
        <BookAMeeting onClose={onClose} />
      </div>
    </div>
  );
};

export default UpgradeModal;
