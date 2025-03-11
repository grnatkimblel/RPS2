function InputField({ classes, value, hook, title, type, minLength, tabIndex, inputRef, placeholder }) {
  // im not sure if form is needed
  return (
    <input
      className={classes}
      value={value}
      onChange={(event) => {
        hook(event.target.value);
      }}
      title={title}
      autoComplete="true"
      type={type}
      size="20"
      minLength={minLength}
      maxLength="20"
      tabIndex={tabIndex}
      ref={inputRef}
      placeholder={placeholder}
    ></input>
  );
}

export default InputField;
