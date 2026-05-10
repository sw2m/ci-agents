import { Agent, type AgentOptions } from "./agent.ts";

/**
 * Gemini agent — uses the `gemini` CLI with --yolo and --skip-trust
 * flags for non-interactive CI usage.
 */
export class Gemini extends Agent {
  private installed = false;

  constructor(opts: AgentOptions = {}) {
    super(opts);
  }

  protected async install(): Promise<void> {
    if (this.installed) return;
    // Idempotent: install gemini CLI if not present
    try {
      const check = new Deno.Command("which", { args: ["gemini"], stdout: "null", stderr: "null" });
      const result = await check.output();
      if (!result.success) {
        const install = new Deno.Command("npm", { args: ["install", "-g", "@google/gemini-cli"], stdout: "inherit", stderr: "inherit" });
        const res = await install.output();
        if (!res.success) throw new Error("Failed to install gemini CLI");
      }
    } catch {
      const install = new Deno.Command("npm", { args: ["install", "-g", "@google/gemini-cli"], stdout: "inherit", stderr: "inherit" });
      await install.output();
    }
    this.installed = true;
  }

  protected command(): string[] {
    const args = ["gemini", "--yolo", "--skip-trust"];
    if (this.model) {
      args.push("--model", this.model);
    }
    return args;
  }
}
