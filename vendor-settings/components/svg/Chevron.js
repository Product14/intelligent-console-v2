const Chevron = ({ rotate = 0, className, onClick }) => (
  <svg
    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${className}`}
    style={{ transform: `rotate(${rotate}deg)` }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    onClick={onClick}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default Chevron;
