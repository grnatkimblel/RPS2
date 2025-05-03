import { useEffect, useState } from "react";

export default function useCountdownMs(duration: number, countdownKey: number): number {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    console.log("useCountdownMs: duration changed", duration);
    setTimeLeft(duration); // Reset timeLeft when duration prop changes
  }, [duration, countdownKey]);

  useEffect(() => {
    console.log("useCountdownMs: timeLeft", timeLeft);
    if (timeLeft <= 0) {
      console.log("useCountdownMs: countdown finished");
      return;
    }
    const subseconds = timeLeft % 1000;
    const countdown = setTimeout(
      () => {
        console.log("useCountdownMs: tick", timeLeft, subseconds);
        if (subseconds > 0) {
          setTimeLeft(timeLeft - subseconds);
        } else {
          setTimeLeft(timeLeft - 1000);
        }
      },
      subseconds != 0 ? subseconds : 1000
    );
    //cleanup
    return () => {
      console.log("useCountdownMs: clearing timeout");
      clearTimeout(countdown);
    };
  }, [timeLeft]);

  return timeLeft;
}
