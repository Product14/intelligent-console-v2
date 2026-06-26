const CrossIcon = ({ className = '', onClick = () => {} }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path
        d="M13.3307 13.3385L2.66406 2.67188M13.3307 2.67188L2.66406 13.3385"
        stroke="currentColor"
        stroke-width="1.33333"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default CrossIcon;
