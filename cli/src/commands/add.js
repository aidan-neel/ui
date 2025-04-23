#!/usr/bin/env node

import { Command } from "commander";
import kleur from "kleur";
import { Listr } from "listr2";
import path from "node:path";
import process from "node:process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { get } from "https";

export function initializeAdd(program) {
    const log = {
        info: (msg) => console.log(kleur.blue(msg)),
        warn: (msg) => console.log(kleur.yellow().bold(msg)),
        error: (msg) => console.error(kleur.red().bold(msg)),
        success: (msg) => console.log(kleur.green().bold(msg)),
    };

    const githubBase =
        "https://raw.githubusercontent.com/aidan-neel/neel-ui/ui/registry/ui/default";

    const availableComponents = [
        "alert-dialog",
        "alert",
        "badge",
        "button",
        "card",
        "checkbox",
        "input",
        "modal",
        "popover",
        "skeleton",
        "toast",
    ];

    const fetchFile = (url) =>
        new Promise((resolve, reject) => {
            get(url, (res) => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`Failed to fetch ${url}`));
                }

                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(data));
            }).on("error", reject);
        });

    program
        .command("add [components...]")
        .description("add command")
        .option("--cwd <path>", "Working directory", process.cwd())
        .option("--silent", "Suppress output", false)
        .action(async (componentsArg, opts) => {
            try {
                const cwd = path.resolve(opts.cwd || process.cwd());

                if (!existsSync(cwd)) {
                    log.error(`Directory ${kleur.cyan(cwd)} does not exist.`);
                    process.exit(1);
                }

                if (!opts.silent) {
                    log.info(`Starting installation at ${kleur.magenta(cwd)}`);
                }

                let components = [];

                if (componentsArg.length === 1 && componentsArg[0] === "*") {
                    components = availableComponents;
                } else {
                    components = componentsArg.filter((name) =>
                        availableComponents.includes(name)
                    );
                }

                // Always include button
                if (!components.includes("button")) {
                    components.unshift("button");
                }

                const tasks = new Listr(
                    components.map((name) => ({
                        title: `Installing ${name}`,
                        task: async () => {
                            const url = `${githubBase}/${name}.svelte`;
                            const destPath = path.resolve(
                                "src/lib/ui/components",
                                `${name}.svelte`
                            );

                            mkdirSync(path.dirname(destPath), {
                                recursive: true,
                            });

                            const data = await fetchFile(url);
                            writeFileSync(destPath, data, "utf8");
                        },
                    })),
                    {
                        rendererOptions: { collapse: false },
                    }
                );

                await tasks.run();

                if (!opts.silent) {
                    log.success("All components installed.");
                }
            } catch (err) {
                log.error("Something went wrong.");
                console.error(err);
                process.exit(1);
            }
        });
}
