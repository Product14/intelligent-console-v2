const GreenTick = ({
  height = 19,
  width = 24,
  fill = 'none',
  stroke = 'none',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 19"
      fill={fill || '#00C488'}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M23.9974 2.34875L7.9974 18.3487L0.664062 11.0154L2.54406 9.13542L7.9974 14.5754L22.1174 0.46875L23.9974 2.34875Z" />
    </svg>
  );
};

export default GreenTick;
