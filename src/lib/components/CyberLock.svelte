<script lang="ts">
    import { onMount } from "svelte";
    import { gsap } from "gsap";
    import { browser } from "$app/environment";

    // Game Configuration
    const LEVELS = 3;
    const TOLERANCE = 15; // Degrees of freedom for a successful lock

    // State
    let currentLevel = 0;
    let isPlaying = false;
    let isWon = false;
    let isFailed = false;

    // Ring Refs
    let rings: HTMLElement[] = [];
    let coreRef: HTMLElement;
    let statusRef: HTMLElement;

    // Rotations
    let rotations = [0, 0, 0];
    let speeds = [2, -3, 4]; // Rotation speed per frame
    let animationId: number;

    // Target Zones (Degrees where the gap should align, e.g., 0 = top)
    const TARGET_ANGLE = 0;

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        isWon = false;
        isFailed = false;
        currentLevel = 0;
        rotations = [
            Math.random() * 360,
            Math.random() * 360,
            Math.random() * 360,
        ];

        // Reset Visuals
        gsap.to(rings, { opacity: 0.3, scale: 1, duration: 0.5 });
        gsap.to(rings[0], {
            opacity: 1,
            boxShadow: "0 0 20px #00d9ff",
            duration: 0.3,
        });
        if (statusRef)
            statusRef.textContent = "SYSTEM LOCKED // DECRYPTION REQUIRED";

        loop();
    }

    function loop() {
        if (!isPlaying || isWon || isFailed) return;

        // Rotate only the current level ring
        rotations[currentLevel] += speeds[currentLevel];
        if (rings[currentLevel]) {
            rings[currentLevel].style.transform =
                `rotate(${rotations[currentLevel]}deg)`;
        }

        animationId = requestAnimationFrame(loop);
    }

    function handleAction() {
        if (!isPlaying) {
            startGame();
            return;
        }

        if (isWon || isFailed) {
            startGame(); // Restart
            return;
        }

        // Check Lock
        const currentRotation = rotations[currentLevel] % 360;
        // Normalize rotation to 0-360 range
        const normalized =
            currentRotation < 0 ? currentRotation + 360 : currentRotation;

        // Calculate difference from target (0 deg is top, but CSS rotate starts at 0.
        // If our ring gap is visually at top at 0deg, then we check distance from 0/360)
        // Let's assume the gap is at 0 degrees visually.

        let diff = Math.abs(normalized - TARGET_ANGLE);
        if (diff > 180) diff = 360 - diff; // Handle wrap-around

        if (diff <= TOLERANCE) {
            // Success Lock
            lockRing(currentLevel);
            currentLevel++;

            if (currentLevel >= LEVELS) {
                winGame();
            } else {
                // Highlight next ring
                gsap.to(rings[currentLevel], {
                    opacity: 1,
                    boxShadow: "0 0 20px #00d9ff",
                    duration: 0.3,
                });
                // Slightly speed up next ring?
                if (Math.abs(speeds[currentLevel]) < 5)
                    speeds[currentLevel] *= 1.2;
            }
        } else {
            failGame();
        }
    }

    function lockRing(index: number) {
        // Snap visual to precise target? Or keep it "messy" but locked?
        // Let's snap it for satisfaction
        gsap.to(rings[index], {
            rotation: TARGET_ANGLE,
            duration: 0.2,
            ease: "back.out(2)",
            boxShadow: "0 0 30px #00ff00",
            borderColor: "#00ff00",
        });

        // Play sound or haptic feedback here
    }

    function winGame() {
        isPlaying = false;
        isWon = true;
        cancelAnimationFrame(animationId);
        if (statusRef)
            statusRef.textContent = "ACCESS GRANTED // WELCOME ADMIN";

        // Core Reveal Animation
        gsap.to(coreRef, {
            scale: 1.5,
            rotate: 360,
            duration: 1,
            ease: "power2.inOut",
        });
        gsap.to(".cyber-lock-container", {
            backgroundColor: "rgba(0, 20, 0, 0.9)",
            duration: 1,
        });
    }

    function failGame() {
        // Shake effect
        isFailed = true;
        // isPlaying = false; // logic stops
        cancelAnimationFrame(animationId);

        gsap.to(".cyber-lock-container", {
            x: 5,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
        });
        gsap.to(rings[currentLevel], {
            borderColor: "#ff0000",
            boxShadow: "0 0 30px #ff0000",
            duration: 0.2,
        });
        if (statusRef)
            statusRef.textContent = "DECRYPTION FAILED // SYSTEM LOCKDOWN";

        setTimeout(() => {
            isPlaying = false; // Allow restart
        }, 1000);
    }

    onMount(() => {
        // Start waiting state animation
        gsap.to(rings, {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "none",
            stagger: 2,
        });
    });
</script>

<div
    class="cyber-lock-container relative w-full h-[80vh] bg-black flex flex-col items-center justify-center overflow-hidden border-y border-white/10"
    on:click={handleAction}
    on:keydown={(e) => e.code === "Space" && handleAction()}
    tabindex="0"
    role="button"
    aria-label="Cyber Lock Game"
>
    <!-- Background Grid -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div
            class="w-full h-full"
            style="background-image: radial-gradient(circle, #333 1px, transparent 1px); background-size: 40px 40px;"
        ></div>
    </div>

    <!-- HUD Overlay -->
    <div
        class="absolute top-10 left-10 font-mono text-xs text-signal/50 pointer-events-none"
    >
        <div>PROTOCOL: OMEGA</div>
        <div>SEC_LEVEL: {currentLevel + 1}/{LEVELS}</div>
        <div bind:this={statusRef} class="mt-2 text-signal typing-effect">
            SYSTEM STANDBY // CLICK TO START
        </div>
    </div>

    <!-- Game Center -->
    <div
        class="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center"
    >
        <!-- Core -->
        <div
            bind:this={coreRef}
            class="absolute w-20 h-20 bg-void border border-signal rounded-full flex items-center justify-center z-20 shadow-[0_0_50px_rgba(0,217,255,0.2)]"
        >
            <div class="{isWon ? 'text-green-500' : 'text-signal'} font-bold">
                {isWon ? "UNLOCK" : "LOCK"}
            </div>
        </div>

        <!-- Rings -->
        {#each Array(LEVELS) as _, i}
            <div
                bind:this={rings[i]}
                class="absolute rounded-full border border-white/20 border-t-signal border-t-4"
                style="
                    width: {160 + i * 80}px; 
                    height: {160 + i * 80}px;
                    opacity: 0.3;
                    transition: border-color 0.3s;
                "
            >
                <!-- Decorative bits on the ring -->
                <div
                    class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px] w-2 h-4 bg-signal shadow-[0_0_10px_#00d9ff]"
                ></div>
            </div>
        {/each}

        <!-- Target Marker (Top) -->
        <div class="absolute top-0 w-1 h-10 bg-red-500/50 z-10"></div>
    </div>

    <!-- Instruction -->
    <div
        class="absolute bottom-10 font-mono text-xs text-white/40 animate-pulse"
    >
        [ CLICK OR SPACE TO DECRYPT ]
    </div>
</div>

<style>
    .typing-effect {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
    }
</style>
