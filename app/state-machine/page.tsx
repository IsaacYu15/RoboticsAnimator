import { getStates } from "@actions/states";
import { getTransitions } from "@actions/transitions";
import StateMachineCanvas from "./stateMachineCanvas";

export default async function Page() {
  const initialStates = await getStates();
  const initialTransitions = await getTransitions();

  return (
    <StateMachineCanvas
      initialStates={initialStates}
      initialTransitions={initialTransitions}
    />
  );
}
