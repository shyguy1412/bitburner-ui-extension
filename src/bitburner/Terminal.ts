
export function executeOnTerminal(command:string) {
  //Straight from the Docs//

  // Acquire a reference to the terminal text field
  const terminalInput = document.getElementById("terminal-input") as any;

  // Set the value to the command you want to run.
  terminalInput.value = command;

  // Get a reference to the React event handler. Changed this a bit to make it more specific
  const handler = Object.keys(terminalInput).filter(key => /.*reactProps.*/.test(key))[0];

  //Terminal is not open
  if (!handler) return;

  // Perform an onChange event to set some internal values.
  terminalInput[handler].onChange({ target: terminalInput });

  // Simulate an enter press
  terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}
