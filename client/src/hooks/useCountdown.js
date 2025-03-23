import { useEffect, useState } from "react";

export default function useCountdownMs(countdownLength) {
  const [timeLeft, setTimeLeft] = useState(countdownLength);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const subseconds = timeLeft % 1000;
    const countdown = setTimeout(
      () => {
        if (subseconds > 0) {
          setTimeLeft(timeLeft - subseconds);
        } else {
          setTimeLeft(timeLeft - 1000);
        }
      },
      subseconds != 0 ? subseconds : 1000
    );
    //cleanup
    return () => clearTimeout(countdown);
  }, [timeLeft]);

  return timeLeft;
}
