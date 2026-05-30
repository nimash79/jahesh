import { useRef } from "react";

const CustomTimeInput = ({ icon, containerStyle, ...props }) => {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.(); // Chrome / Edge
      inputRef.current.focus();        // Safari / Firefox fallback
    }
  };

  return (
    <div
      className="custom-input-container"
      style={containerStyle}
      onClick={openPicker}
    >
      {icon && (
        <div className="icon" onClick={openPicker}>
          {icon}
        </div>
      )}

      <input
        ref={inputRef}
        type="time"
        lang="en-GB"
        step="60"
        onKeyDown={(e) => e.preventDefault()}
        className={icon ? "custom-input" : "custom-input without-margin"}
        {...props}
      />
    </div>
  );
};

export default CustomTimeInput;