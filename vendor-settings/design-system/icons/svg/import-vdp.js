export default function ImportVdp({ color = '#FFFFFF', className = '' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.4974 3.33594V17.5026H2.49738V6.66926H4.16406V15.8359H15.8307V5.00262H12.4974V3.33594H17.4974ZM6.66406 3.33594C8.90469 3.33594 10.7322 5.10453 10.8269 7.32188L10.8307 7.50262L10.8307 10.4903L12.7415 8.58L13.92 9.75852L9.99738 13.6811L6.0748 9.75848L7.25332 8.57996L9.16406 10.4903V7.50262C9.16406 6.17121 8.12328 5.08289 6.81094 5.00684L6.66406 5.00262H1.66406V3.33594H6.66406Z"
        fill={color}
      />
    </svg>
  );
}
