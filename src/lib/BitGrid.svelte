<script>
    import { perRow } from "./hamming.js";

    // cells: [{ i, value, label, kind: 'data'|'parity'|'overall', opacity, outline: 'select'|'flip'|null, glow }]
    let { cells, interactive = false, onselect = () => {}, label = 'Bits' } = $props();
    const cols = $derived(perRow(cells.length));
</script>

<div class="grid" style="--cols: {cols}" role="group" aria-label={label}>
    {#each cells as c (c.i)}
        <div class="cell" style="opacity: {c.opacity ?? 1}">
            <span class="name">{c.label}</span>
            {#if interactive}
                <button
                    type="button"
                    data-bit={c.i}
                    class="bit {c.kind} {c.outline ? 'ol-' + c.outline : ''}"
                    class:glow={c.glow}
                    aria-label="{c.label}, value {c.value}"
                    onclick={() => onselect(c.i)}>
                    {c.value}
                </button>
            {:else}
                <span class="bit {c.kind} {c.outline ? 'ol-' + c.outline : ''}" class:glow={c.glow}>
                    {c.value}
                </span>
            {/if}
        </div>
    {/each}
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(var(--cols), 44px);
        gap: 8px 6px;
        width: max-content; /* shrink to the bits, then center to the container */
        max-width: 100%;
        margin-inline: auto;
        overflow-x: auto;
        padding: 8px 8px 10px; /* room for the selection and flip rings */
    }
    .cell{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        transform: opacity 0.2s;
    }
    .name{
        height: 0.95rem;
        font: 500 0.7rem/0.95rem var(--mono);
        color: var(--muted);
    }
    .bit{
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 8px;
        border: 1.5px solid var(--data-edge);
        background: var(--data);
        color: #ffffff;
        font: 600 1rem var(--mono);
    }
    .bit.parity { background: var(--parity); border-color: var(--parity-edge); }
    .bit.overall { background: var(--overall); border-color: var(--overall-edge); }

    /* Selected / flipped bits will have a thick coloured border and a separate outer ring with a gap for visibility */
    .bit.ol-select { border-color: var(--select); border-width: 3px; box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--select); }
    .bit.ol-flip { border-color: var(--flip); border-width: 3px; box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--flip); }
    .bit.glow { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--select), 0 0 16px 6px rgba(255, 194, 71, 0.45); }

    button.bit:hover { transform: translateY(-1px); }
    button.bit:not(.ol-select):not(.ol-flip):hover { border-color: var(--select); }
    button.bit:focus-visible { outline: 2px solid var(--select); outline-offset: 2px; }

    @media (prefers-reduced-motion: reduce) {
        .cell, button.bit { transition: none; }
        button.bit.hover { transform: none; }
    }
</style>