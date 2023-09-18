import InputField from "./InputField";

import { useRef } from "react";

function LoginInputButton({ fieldName, fieldType, tabIndex, stateVar, hook }) {
  const inputFieldRef = useRef(null);
  const inputHint =
    fieldType === "text"
      ? "Must be at least 3 characters"
      : "Must be at least 6 characters";

  const borders = tabIndex === 1 ? "" : "leftBorder";
  return (
    <button
      style={{ cursor: "text", flex: 1 }}
      className={"defaultColor " + borders}
      onClick={() => inputFieldRef.current.focus()}
    >
      <p className="loginInputFieldName">{fieldName}</p>
      <InputField
        classes="login"
        value={stateVar}
        hook={hook}
        title={inputHint}
        type={fieldType}
        minLength={fieldType === "text" ? "3" : "6"}
        inputRef={inputFieldRef}
        tabIndex={tabIndex}
      />
    </button>
  );
}

export default LoginInputButton;
