<script lang="ts">
    import { onMount } from "svelte";
    import { gsap } from "gsap";
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";

    // Reuse project data or defined new
    const projects = [
        {
            id: "01",
            title: "NEURAL_LINK",
            category: "AI INTERFACE",
            year: "2025",
            video: "/videos/hero-main-loop.mp4",
        },
        {
            id: "02",
            title: "CYBER_DYN",
            category: "ROBOTICS",
            year: "2024",
            video: "/videos/card-engineering-mech.mp4",
        },
        {
            id: "03",
            title: "QUANTUM_CORE",
            category: "DATA VIS",
            year: "2024",
            video: "/videos/card-architecture-holo.mp4",
        },
        {
            id: "04",
            title: "SYNTH_MATRIX",
            category: "WEBGL EXP",
            year: "2023",
            video: "/videos/about-future-interaction.mp4",
        },
        {
            id: "05",
            title: "VOID_ENGINE",
            category: "GAME DEV",
            year: "2023",
            video: "/videos/card-software-flow.mp4",
        },
    ];

    let cursorRef: HTMLDivElement;
    let cursorMediaRef: HTMLDivElement;
    let activeIndex: number | null = null;
    let mouse = { x: 0, y: 0 };

    onMount(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            if (cursorRef) {
                gsap.to(cursorRef, {
                    x: mouse.x,
                    y: mouse.y,
                    duration: 0.5,
                    ease: "power2.out",
                });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    });

    function handleEnter(index: number) {
        activeIndex = index;
        if (cursorMediaRef) {
            gsap.to(cursorMediaRef, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    }

    function handleLeave() {
        activeIndex = null;
        if (cursorMediaRef) {
            gsap.to(cursorMediaRef, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    }
</script>

<svelte:head>
    <title>Archive — Ucuncu Binyil</title>
</svelte:head>

<main
    class="w-full min-h-screen bg-zinc-50 text-black pt-32 pb-20 px-4 md:px-12 relative overflow-hidden"
    in:fade
>
    <!-- Header -->
    <header
        class="mb-20 flex justify-between items-end border-b border-black/10 pb-8"
    >
        <h1
            class="text-6xl md:text-8xl font-display font-bold tracking-tighter"
        >
            ARCHIVE
        </h1>
        <div class="text-right hidden md:block">
            <p class="font-mono text-xs text-zinc-500 mb-2">SELECTED WORKS</p>
            <p class="font-mono text-xs text-zinc-500">2023 — 2025</p>
        </div>
    </header>

    <!-- Project List -->
    <div class="flex flex-col">
        {#each projects as project, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="group relative flex items-center justify-between py-12 border-b border-black/10 cursor-pointer hover:px-4 transition-all duration-300"
                on:mouseenter={() => handleEnter(i)}
                on:mouseleave={handleLeave}
                on:click={() => goto("/work")}
            >
                <div class="flex items-baseline gap-4 md:gap-12">
                    <span class="font-mono text-xs text-zinc-400">0{i + 1}</span
                    >
                    <h2
                        class="text-4xl md:text-6xl font-display font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors"
                    >
                        {project.title}
                    </h2>
                </div>

                <div class="flex items-center gap-8 md:gap-24">
                    <span
                        class="hidden md:block font-mono text-xs tracking-widest text-zinc-500 uppercase"
                        >{project.category}</span
                    >
                    <span class="font-mono text-xs text-zinc-400"
                        >{project.year}</span
                    >
                </div>

                <!-- Hover overlay for list item background (optional subtle highlight) -->
                <div
                    class="absolute inset-x-0 inset-y-0 bg-black/5 scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-500 -z-10"
                ></div>
            </div>
        {/each}
    </div>

    <!-- Floating Cursor Media -->
    <div
        bind:this={cursorRef}
        class="fixed top-0 left-0 w-80 h-56 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-exclusion md:block hidden"
    >
        <div
            bind:this={cursorMediaRef}
            class="w-full h-full bg-zinc-900 opacity-0 scale-0 origin-center overflow-hidden rounded-lg shadow-2xl relative"
        >
            {#if activeIndex !== null}
                {#key activeIndex}
                    <video
                        src={projects[activeIndex].video}
                        autoplay
                        loop
                        muted
                        playsinline
                        class="w-full h-full object-cover text-white"
                    ></video>
                {/key}
            {/if}

            <!-- Overlay text on video -->
            <div
                class="absolute bottom-4 left-4 text-white font-mono text-xs z-10"
            >
                VIEW CASE STUDY
            </div>
        </div>
    </div>
</main>

<style>
    :global(body) {
        background-color: #fafafa;
    }
</style>
