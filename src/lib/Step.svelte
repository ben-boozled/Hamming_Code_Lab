<script>
    // One step of the Hamming code pipeline; drawn using a vertical rail to make it obvious
    let { num, title, sub = '', children} = $props();
</script>

<section class="step" id="step-{num}">
    <div class="rail"><span class="num">{num}</span></div>
    <div class="body">
        <h2>{title}</h2>
        {#if sub}<p class="sub">{@html sub}</p>{/if}
        {@render children?.()}
    </div>
</section>

<style>
    .step {
        display: grid;
        grid-template-columns: 2.4rem minmax(0, 1fr);
        column-gap: 1.1rem;
    }
    .rail {
        position: relative;
        display: flex;
        justify-content: center;
    }
    .rail::after {
        content: '';
        position: absolute;
        top: 2.2rem;
        bottom: -0.2rem;
        width: 1px;
        background: var(--border);
    }
    .step:last-of-type .rail::after { display: none; }
    .num {
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        border: 1.5px solid var(--border-strong);
        background: var(--bg);
        font: 600 0.85rem var(--mono);
        color: var(--text-strong);
        z-index: 1;
    }
    .body { padding-bottom: 2.8rem; min-width: 0; }
    h2 {
        margin: 0.15rem 0 0.25rem;
        font-size: 1.3rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--text-strong);
    }
    .sub { margin: 0 0 1.1rem; color: var(--muted); font-size: 0.95rem; line-height: 1.55; }

    /* Only activate below if the device screen width is <= 560px */
    @media (max-width: 560px) {
        .step { grid-template-columns: 1.8rem minmax(0, 1fr); column-gap: 0.7rem; }
        .num { width: 1.7rem; height: 1.7rem; font-size: 0.78rem; }
    }
</style>