import { useEffect, useState } from "react";

import QuickdrawArenaView from "../QuickdrawArenaView";

export default function QuickdrawArenaController({ setDisplayState, quickdrawSessionData }) {
  return <QuickdrawArenaView setMainDisplayState={setDisplayState} quickdrawSessionData={quickdrawSessionData} />;
}
