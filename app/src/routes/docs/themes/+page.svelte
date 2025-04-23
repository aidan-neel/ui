<script lang="ts">
    import CodeBlock from "$lib/components/docs/code-block.svelte";
</script>

<main class="flex flex-col w-full h-screen">
	<header class="flex flex-col gap-1 pb-6 border-b rounded-none">
		<p class="text-4xl font-bold">Custom Themes</p>
		<p class="text-lg text-foreground-muted">Create and install custom themes from the registry</p>
	</header>

    <section class="flex flex-col gap-1 mt-6">
		<p class="text-2xl font-semibold">Create a theme</p>
        <p class="text-base py-4">
            Customize a theme to your liking using Tailwind. See more <a href="https://tailwindcss.com/docs/theme" class="underline font-medium">here.</a>
            Below is an example theme called 'Neon'.
        </p>
        <CodeBlock code={`@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');

@theme {
	/* Fonts */
	--header-font: 'Inter';
	--body-font: 'Inter';
	--mono-font: 'JetBrains Mono';

	--font-sans: 'Inter';
	--font-mono: 'JetBrains Mono';

	/* Colors */
	--color-background: #121212;
	--color-border: #1e1e1e;
	--color-primary: #00e5ff;
	--color-primary-alternate: #00bcd4;
	--color-primary-hovered: #008ba3;
	--color-flat: #00acc1;
	--color-flat-foreground: #00e5ff;
	--color-flat-hovered: #0097a7;
	--color-foreground-opposite: #000000;
	--color-foreground: #e0e0e0;
	--color-foreground-muted: #a0a0a0;
	--color-secondary: #1c1c1c;
	--color-secondary-hovered: #242424;
	--color-ghost-hovered: #2a2a2a;
	--color-accent: #ff4081;
	--color-alternate: #303030;
	--color-alternate-hovered: #3a3a3a;
	--color-outlined-hovered: #474747;
	--color-success: #00c853;
	--color-warning: #ffab00;
	--color-error: #d50000;
	--color-destructive: #ff1744;
	--color-destructive-hovered: #b2102f;
	--color-primary-active: #006064;
	--color-flat-active: #007c91;
	--color-secondary-active: #333333;
	--color-ghost-active: #3a3a3a;
	--color-alternate-active: #4a4a4a;
	--color-outlined-active: #5a5a5a;
	--color-destructive-active: #8e0000;

	/* Disabled Colors */
	--color-primary-disabled: #004d5a;
	--color-primary-alternate-disabled: #00474f;
	--color-primary-hovered-disabled: #003e44;
	--color-flat-disabled: #004349;
	--color-flat-foreground-disabled: #005a6e;
	--color-flat-hovered-disabled: #003940;
	--color-secondary-disabled: #2e2e2e;
	--color-secondary-hovered-disabled: #262626;
	--color-ghost-hovered-disabled: #1e1e1e;
	--color-alternate-disabled: #545454;
	--color-alternate-hovered-disabled: #424242;
	--color-outlined-hovered-disabled: #383838;
	--color-border-disabled: #404040;
	--color-text-disabled: #666666;
	--color-background-disabled: #191919;
	--color-destructive-disabled: #5a1a1a;

	/* Border radius */
	--radius: 0.5rem;

	/* Sizes */
	--height-btn: 2.5rem;
	--padding-x-btn: 1.25rem;
}
`} class="p-3 max-h-[25rem]" lang="css" />
	</section>

	<section class="flex flex-col gap-1 mt-6">
		<p class="text-2xl font-semibold">Install a theme</p>
        <p class="text-base py-4">
            Use the CLI to install a theme to your project. A list of themes with previews are available <a href="/themes" class="underline font-medium">here.</a>
        </p>
        <CodeBlock code={"npx @aidan-neel/ui theme install [name]"} class="p-3" lang="shell" />
        <p class="text-base py-4">
            After installing, make sure to import your chosen theme in the main css file.
        </p>
        <CodeBlock code={`/* Chosen Theme */
@import './themes/default.css';
`} class="p-3" lang="css" />
        <p class="text-base py-4">
            Alternatively, use the themes URL to use it without having to download it.
        </p>
        <CodeBlock code={`/* Chosen Theme */
@import 'https://ui.aidan-neel.com/themes/default.css';
`} class="p-3" lang="css" />
	</section>

    <section class="flex flex-col gap-1 mt-6">
		<p class="text-2xl font-semibold">Publish a theme</p>
        <p class="text-base py-4">
            Use the CLI to publish a theme to the registry.
        </p>
        <CodeBlock code={"npx @aidan-neel/ui theme publish [name].css"} class="p-3" lang="shell" />
        <p class="text-base py-4">
            Assuming a theme by the same name does not already exist, it will take the CSS file name and publish the theme.
        </p>
	</section>
</main>
