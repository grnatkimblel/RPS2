function LoginButton({ styles, validationFormula, OnClick, errorText }) {
  let isSubmittable = validationFormula();

  return (
    <button
      style={styles}
      className={"bottomBorder leftBorder transition" + (isSubmittable ? " submittable" : " defaultColor")}
      onClick={() => {
        if (isSubmittable) {
          OnClick();
        } else {
          alert(errorText);
        }
      }}
    >
      Login
    </button>
  );
}

export default LoginButton;
