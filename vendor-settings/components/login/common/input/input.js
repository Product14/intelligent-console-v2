import { memo } from "react";

function Input({
  className = "",
  placeholder = "",
  onChange = () => {},
  value = "",
  required = "",
  type = "text",
  id = "",
  autoComplete = "off",
  textAtTop = "",
  name="",
  onBlur,
  onWheel = () => {},
  style = {},
  onClick = () => {},
  placeHolderClass = ""
}) {
  return (
    <div className="relative w-full h-full">
      <input
        name={name}
        type={type}
        onBlur={onBlur}
        className={`w-full h-full p-[10px] rounded-lg ${className || ""} ${placeHolderClass}`}
        style={style}
        required={required}
        autoComplete={autoComplete}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onWheel={onWheel}
        onClick={onClick}
      />
      {String(value) && textAtTop ? (
        <div>
          <span className="!absolute !text-grey !text-[12px] !top-[0px] !left-[6px] !-translate-y-1/2 bg-white"
            style={{
              background: 'white',
            }}>
            {textAtTop}
          </span>
        </div>
      ):null}
    </div>
  );
}

export default memo(Input);
