import { Agent, type AgentOptions } from "./agent.ts";

/**
 * Claude agent — uses the `claude` CLI with --print flag for
 * non-interactive single-shot prompting.
 */
export class Claude extends Agent {
  private installed = false;

  constructor(opts: AgentOptions = {}) {
    super(opts);
  }

  protected async install(): Promise<void> {
    if (this.installed) return;
    // Idempotent: install claude CLI if not present
    try {
      const check = new Deno.Command("which", { args: ["claude"], stdout: "null", stderr: "null" });
      const result = await check.output();
      if (!result.success) {
        const install = new Deno.Command("npm", { args: ["install", "-g", "@anthropic-ai/claude-code"], stdout: "inherit", stderr: "inherit" });
        const res = await install.output();
        if (!res.success) throw new Error("Failed to install claude CLI");
      }
    } catch {
      // If `which` itself fails, try installing
      const install = new Deno.Command("npm", { args: ["install", "-g", "@anthropic-ai/claude-code"], stdout: "inherit", stderr: "inherit" });
      await install.output();
    }
    this.installed = true;
  }

  protected command(): string[] {
    const args = ["claude", "--print"];
    if (this.model) {
      args.push("--model", this.model);
    }
    return args;
  }
}
