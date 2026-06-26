/**@format   */

const Twitter = ({ width = 32, height = 32, fill = '#000' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
    >
      <g opacity="0.3">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M21.336 25.3385L8.27734 6.67188H11.0067L24.0467 25.3385H21.336Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11.7008 5.33594H5.7168L20.6408 26.6693H26.6035L11.7008 5.33594Z"
          fill="black"
        />
      </g>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.5076 16.4805L15.0943 18.7205L7.1743 28.0005H3.6543L13.5076 16.4805Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M27.6541 4L18.3741 14.88L16.8008 12.6267L24.1874 4H27.6541Z"
        fill="black"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.0056 6.66667L24.0442 25.3333H21.3349L8.27625 6.66667H11.0056ZM12.3962 4H3.15625L19.9469 28H29.1602L12.3962 4Z"
        fill="black"
      />
    </svg>
  );
};

export default Twitter;
