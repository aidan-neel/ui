#!/usr/bin/env node

import { Command } from "commander";
import kleur from "kleur";
import { Listr } from "listr2";
import path from "node:path";
import process from "node:process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import inquirer from "inquirer";
import { execSync } from "node:child_process";
import { get } from "https";

export function initializeInit(program) {
    const log = {
        info: (msg) => console.log(kleur.blue(msg)),
        warn: (msg) => console.log(kleur.yellow().bold(msg)),
        error: (msg) => console.error(kleur.red().bold(msg)),
        success: (msg) => console.log(kleur.green().bold(msg)),
    };

    const githubBase =
        "https://raw.githubusercontent.com/aidan-neel/ui/ui/registry";

    const fileMap = {
        "config/ui.css": "src/lib/ui/ui.css",
        "config/utils.ts": "src/lib/ui/utils.ts",
        "config/internals/body.ts": "src/lib/ui/internals/body.ts",
        "config/internals/state.svelte.ts":
            "src/lib/ui/internals/state.svelte.ts",
        "config/internals/transition.ts": "src/lib/ui/internals/transition.ts",
        "config/internals/trigger.ts": "src/lib/ui/internals/trigger.ts",
        "config/components/internals/background-blur.svelte":
            "src/lib/ui/components/internals/background-blur.svelte",
        "themes/default.css": "src/lib/ui/themes/default.css",
    };

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
        .command("init")
        .description("initialize project")
        .option("--cwd <path>", "Working directory", process.cwd())
        .option("--silent", "Suppress output", false)
        .action(async (opts) => {
            try {
                const cwd = path.resolve(opts.cwd || process.cwd());

                if (!existsSync(cwd)) {
                    log.error(`Directory ${kleur.cyan(cwd)} does not exist.`);
                    process.exit(1);
                }

                const confirm = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "proceed",
                        message: kleur.yellow(
                            "Are you in the root of your working Svelte project?"
                        ),
                        default: false,
                    },
                ]);

                if (!confirm.proceed) {
                    log.warn("Operation cancelled.");
                    process.exit(0);
                }

                if (!opts.silent) {
                    log.info(`Initializing at ${kleur.magenta(cwd)}`);
                }

                const tasks = new Listr(
                    [
                        {
                            title: "Setting up directories",
                            task: async () => {
                                const directories = [
                                    "src/lib/ui",
                                    "src/lib/ui/components",
                                    "src/lib/ui/internals",
                                    "src/lib/ui/themes",
                                    "src/lib/ui/components/internals",
                                ];

                                directories.forEach((directory) => {
                                    if (!existsSync(directory)) {
                                        mkdirSync(directory, {
                                            recursive: true,
                                        });
                                    }
                                });
                            },
                        },
                        {
                            title: "Downloading registry files",
                            task: async () => {
                                for (const [
                                    remotePath,
                                    localPath,
                                ] of Object.entries(fileMap)) {
                                    const url = `${githubBase}/${remotePath}`;
                                    const destPath = path.resolve(localPath);
                                    const destDir = path.dirname(destPath);

                                    mkdirSync(destDir, { recursive: true });

                                    const data = await fetchFile(url);
                                    writeFileSync(destPath, data, "utf8");
                                }
                            },
                        },
                        {
                            title: "Installing dependencies from registry",
                            task: async () => {
                                const depUrl = `${githubBase}/config/dependencies.json`;
                                const packageJsonPath =
                                    path.resolve("./package.json");

                                if (!existsSync(packageJsonPath)) {
                                    throw new Error(
                                        "No package.json found in the root directory."
                                    );
                                }

                                const depJson = await fetchFile(depUrl);
                                const dependencies = JSON.parse(depJson);

                                const pkg = JSON.parse(
                                    readFileSync(packageJsonPath, "utf8")
                                );
                                pkg.dependencies = {
                                    ...(pkg.dependencies || {}),
                                    ...dependencies.dependencies,
                                };

                                writeFileSync(
                                    packageJsonPath,
                                    JSON.stringify(pkg, null, 2) + "\n"
                                );
                            },
                        },
                    ],
                    {
                        rendererOptions: {
                            collapse: false,
                        },
                    }
                );

                await tasks.run();

                if (!opts.silent) {
                    log.success("Project initialized.");
                }
            } catch (err) {
                log.error("Something went wrong.");
                console.error(err);
                process.exit(1);
            }
        });
}
