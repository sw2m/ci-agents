/**
 * Base Agent class — spawns an AI CLI process with a prompt via stdin,
 * captures stdout, and reports stderr on premature death.
 */
export interface AgentOptions {
  model?: string;
  timeout?: number; // seconds
}

export abstract class Agent {
  protected model: string;
  protected timeout: number;

  constructor(opts: AgentOptions = {}) {
    this.model = opts.model ?? "";
    this.timeout = opts.timeout ?? 900;
  }

  /** CLI command and args to spawn. */
  protected abstract command(): string[];

  /** Subclass hook: run any one-time install/setup. */
  protected async install(): Promise<void> {}

  /** Run the agent with the given prompt, return stdout. */
  async run(prompt: string): Promise<string> {
    await this.install();

    const cmd = this.command();
    const proc = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    const child = proc.spawn();

    // Write prompt to stdin then close
    const writer = child.stdin.getWriter();
    await writer.write(new TextEncoder().encode(prompt));
    await writer.close();

    // Race against timeout
    const timer = setTimeout(() => {
      try { child.kill(); } catch { /* already dead */ }
    }, this.timeout * 1000);

    const output = await child.output();
    clearTimeout(timer);

    const stdout = new TextDecoder().decode(output.stdout);
    const stderr = new TextDecoder().decode(output.stderr);

    if (!output.success) {
      // stdin-death fix: if the process dies, surface stderr so the caller
      // gets a meaningful error instead of silent failure.
      const code = output.code;
      throw new Error(
        `Agent process exited with code ${code}.\nstderr:\n${stderr}`
      );
    }

    if (stderr.trim()) {
      console.warn(`[agent stderr] ${stderr.trim()}`);
    }

    return stdout;
  }
}
