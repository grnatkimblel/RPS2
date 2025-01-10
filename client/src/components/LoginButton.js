function LoginButton({ styles, validationFormula, OnClick }) {
  let isSubmittable = validationFormula();

  return (
    <button
      style={styles}
      className={"bottomBorder leftBorder transition" + (isSubmittable ? " submittable" : " notInteractableColor")}
      onClick={() => {
        //change button to be not interactable
        OnClick();
        //change button back
      }}
    >
      Login
    </button>
  );
}

export default LoginButton;
