<script>
    // Show how the parity check results add up to form the syndrome
    let { code, res } = $props();

    // Most significant check first so that the boxes read like the binary syndrome
    const order = $derived(Array.from({ length: code.r }, (_, k) => code.r - 1 - k));
    const terms = $derived(order.map((i) => `${res.syndromeBits[i]}×${1 << i}`).join(' + '));
    const failing = $derived(order.filter((i) => res.syndromeBits[i]).map((i) => `p${1 << i} (${1 << i})`));
    const binary = $derived(order.map((i) => res.syndromeBits[i]).join(''));
</script>

<div class ="syn" role="group" aria-label="Parity checks and syndrome">
    {#each order as i (i)}
        <div class="box" class:fail={res.syndromeBits[i]} class:pass={!res.syndromeBits[i]}>
            <span class="t">p{1 << i} check</span>
            <span class="b">{res.syndromeBits[i]}</span>
            <span class="w">weight {1 << i}</span>
        </div>
    {/each}
    <span class="eq">{terms} =</span>
    <div class="result">
        <span class="t">Syndrome</span>
        <span class="b">{res.syndrome}</span>
        <span class="w">{binary}₂</span>
    </div>
</div>

<p class="note">
    {#if res.syndrome === 0}
        Every check passes. As such, the syndrome is 0 and the Hamming bits show no error.
    {:else if res.syndrome <= code.n}
        Failing checks add their weights: {failing.join(' + ')} = {res.syndrome}. The syndrome is the position of the error:
        <b>{code.names[code.idx(res.syndrome)]}</b> (position {res.syndrome}).
    {:else}
        Failing checks add up to {res.syndrome}, but this word only has positions 1 to {code.n}. Hence, the syndrome is not a valid position. 
    {/if}    
    {#if code.secded && res.status === 'double'}
        The overall parity bit is even. This means the two errors cancelled out each other and the calculated position cannot be trusted.
    {/if}
</p>

<style>
    .syn { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .box, .result { 
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 4.4rem;
        padding: 0.4rem 0.rem;
        border-radius: 8px;
        border: 1px solid;
    }
    .pass { border-color: rgba(95, 208, 138, 0.5); background: rgba(95, 208, 138, 0.1); }
    .fail { border-color: rgba(239, 107, 107, 0.7); background: rgba(239, 107, 107, 0.16); }
    .result { border-color: var(--select); background: rgba(242, 176, 74, 0.12); padding-inline: 1rem; }
    .t, .w { font-size: 0.72rem; color: var(--muted); }
    .b { font: 600 1.35rem/1.35 var(--mono); color: var(--text-strong); }
    .eq { font: 500 0.95rem var(--mono); color: var(--text); padding: 0 0.2rem; }
    .note { margin: 0.7rem 0 0; color: var(--muted); font-size: 0.9rem; line-height: 1.55; }
    .note b { color: var(--text-strong); font-family: var(--mono); }
</style>