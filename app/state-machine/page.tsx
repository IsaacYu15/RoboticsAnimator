import { getStates } from "@actions/states";
import { getTransitions } from "@actions/transitions";
import StateMachineCanvas from "./stateMachineCanvas";

export default async function Page() {
  // Fetch everything on the server
  const [initialStates, initialTransitions] = await Promise.all([
    getStates(),
    getTransitions(),
  ]);

  return (
    <StateMachineCanvas
      initialStates={initialStates}
      initialTransitions={initialTransitions}
    />
  );
}
