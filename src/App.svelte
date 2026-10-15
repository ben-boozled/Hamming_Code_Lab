 <!-------  Script Block (Page Logic) ------->

<script>
	import { MAX_BYTES, STATUS, textToBits, bitsToText, createCode } from './lib/hamming.js';
	import { coverageCells, coverageInfo } from './lib/cells.js';
	import Step from './lib/Step.svelte';
	import BitGrid from './lib/BitGrid.svelte';
	import SyndromePanel from './lib/SyndromePanel.svelte'
	import Pig from './lib/Pig.svelte'; // this is the most important component

	// ------- Independent, Mutable, and Reactive State Variables -------
	let text = $state("Yerhoo!")
	let secded = $state(true);	// start with secded turned on
	let flips = $state([]); 	// indices of bits flipped in transit
	let sel2 = $state(null);	// selected bit in step 2 (encode)
	let sel4 = $state(null);	// selected bit in step 4 (decode)

	// Easter egg: typing "Hamming" makes a pig jump out ;) 
	let pigShow = $state(false);
	let pigRun = $state(0);		// bumping this restarts the animation
	let pigTimer;

	// test match for the word "hamming"; the "i" flag ignores case
	function maybeOink(prevText, nextText) {
		if (/hamming/i.test(nextText) && !/hamming/i.test(prevText)) {
			pigRun += 1;
			pigShow = true;
			clearTimeout(pigTimer);
			pigTimer = setTimeout(() => (pigShow = False), 4400)	// reset pigShow after 4400ms
		}
	}

	// resets the state variables whenever the message or SECDED toggle changes
	function reset() {
		flips = [];
		sel2 = null;
		sel4 = null;
	}

	// ------- Derived, Read-only Values (from state variables) -------
	const byteLen = $derived(new TextEncoder().encode(text).length);
	const valid = $derived(byteLen > 0 && byteLen <= MAX_BYTES);
	const bits = $derived(valid ? textToBits(text).bits : []);
	const code = $derived(valid ? createCode(bits.length, secded) : null);
	const codeword = $derived(code ? code.encode(bits) : []);
	const received = $derived(codeword.map((v, i) => (flips.includes(i) ? v ^ 1 : v))); // flips the bits (if any) of the received codeword
	const res = $derived(code ? code.decode(received) : null);

	const rows = $derived(
		valid 
			? Array.from(text).map((ch) => ({
				ch,
				cp: ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'),
				bytes: [...new TextEncoder().encode(ch)],
				}))
			: []
	);
	const allBytes = $derived(rows.flatMap((r) => r.bytes));

	/* Key elements for Step 2: Encode */
	const sub2 = $derived(
		code
			? `Below is the smallest code that fits all ${code.k} bits in one block: r is the minimum value such that 2<sup>r</sup> ≥ k + r + 1.` +
			  (code.k < code.fullK ? ` It is shortened from the standard Hamming (${2**code.r - 1}, ${code.fullK}). ` +
			   "This Hamming code implements even parity checks; the parity bits should be set such that the total number of 1s in their coverage area is even."
			  : '')
			: ''
	);
	const cells2 = $derived(code ? coverageCells(code, codeword, sel2) : []);
	const info2 = $derived(code ? coverageInfo(code, sel2) : null);

	/* Key elements for Step 3: Corrupt */
	const cells3 = $derived(
		code
			? received.map((value, i) => ({
				i, value, label: code.names[i], kind: code.kinds[i], opacity: 1,
				outline: flips.includes(i) ? 'flip' : null, glow: false,
			}))
			: []
	);

	const flippedNames = $derived(code ? flips.toSorted((a, b) => a - b).map((i) => code.names[i]).join(', ') : '');

	/* Key elements for Step 4: Decode */
	const cells4 = $derived(code ? coverageCells(code, received, sel4) : []);
	const info4 = $derived(code ? coverageInfo(code, sel4) : null);
	const cellsFixed = $derived(
			code && res
				? res.corrected.map((value, i) => ({
					i, value, label: code.names[i], kind: code.kinds[i], opacity: 1,
					outline: i === res.errIdx ? 'select' : null, glow: false,
				}))
				: []
	);	

	const diagnosis = $derived.by(() => {
		if (!res) return null;
		const s = STATUS[res.status];
		const action = res.status === 'corrected' ? `Flipped ${code.names[res.errIdx]} back (position ${res.syndrome}).` : s.action;
		return { ...s, action };
	})

	// Rules for how the diagnosis is decided based on the syndrome (shown in the tooltip); highlights the row matching the current result
	const rules = $derived.by(() =>{
		if (!code) return [];
		if (code.secded)
			return [
				{ key: 'ok', s: '0', o: 'Even', d: 'No error.' },
				{ key: 'overall', s: '0', o: 'Odd', d: 'Error in p0 only. Corrected.' },
				{ key: 'corrected', s: `1 to ${code.n}`, o: 'Odd', d: 'Single error at that position. Corected.' },
				{ key: 'double', s: 'Not 0', o: 'Even', d: 'Double errors. Detected but not correctable.' },
				{ key: 'invalid', s: `Above ${code.n}`, o: 'Odd', d: 'Multiple errors. Detected but not correctable.' },
			];
		return [
			{ key: 'ok', s: '0', d: 'No error' },
			{ key: 'corrected', s: `1 to ${code.n}`, d: 'Treated as a single error at that position (note that a double error can be mistake for this).' },
			{ key: 'invalid', s: `Above ${code.n}`, d: 'Multiple errors. Detected but not correctable.'},
		];
	})

	const dataMatches = $derived(res ? res.data.every((b, i) => b === bits[i]) : false);

	/* Key elements for Step 5: Recover */
	const decodedText = $derived(res ? bitsToText(res.data) : '');

	const outcome = $derived.by(() => {
		if (!res) return null;
		if (decodedText === text && flips.length === 0) return { tone: 'ok', text: 'Tadah! The message arrived intact.' };
		if (decodedText === text) return { tone: 'ok', text: 'Tadah! Every error has been corrected. The message matches the original.' };
		if (res.status === 'double' || res.status === 'invalid')
			return { tone: 'err', text: 'The errors were detected but could not be corrected. In practice, you would request for a retransmission.' };
		return { tone: 'err', text: 'Silent corruption. The number of errors exceeded the code\'s capabilities. The decoder was fooled.' };
	});

	const rawText = $derived(code ? bitsToText(code.dataIdx.map((i) => received[i])) : '');

	// ------- User Actions -------
	const toggleSel2 = (i) => (sel2 = sel2 === i ? null : i);
	const toggleSel4 = (i) => (sel4 = sel4 === i ? null : i);
	const flip = (i) => (flips = flips.includes(i) ? flips.filter((x) => x !== i) : [...flips, i]);

	// Choose random numbers by shuffling instead of picking because the latter might return the same number
	function randomFlips(count) {
		const pool = Array.from({ length: code.N }, (_, i) => i);
		for (let i = pool.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pool[i], pool[j]] = [pool[j], pool[i]];
		}
		flips = pool.slice(0, count);
	}

	// Click anywhere in the panel except a bit to clear all selections
	const clearIfOutside = (e, clear) => {
		if(!e.target.closest('[data-bit]')) clear();
	};

</script>

 <!------- Markup Block (Page Rendering) ------->

<header class="topbar">
	<div class="brand">
		<!-- Mini "logo" for the web app based on the bits colour scheme =) -->
		<svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
			<rect x="3" y="3" width="12" height="12" rx="3" fill="var(--data-solid)"/>
			<rect x="17" y="3" width="12" height="12" rx="3" fill="var(--parity-solid)"/>
			<rect x="3" y="17" width="12" height="12" rx="3" fill="var(--parity-solid)"/>
			<rect x="17" y="17" width="12" height="12" rx="3" fill="var(--overall-solid)"/>
		</svg>
		<div>
			<h1>Hamming Code Lab</h1>
			<p>A visualiser for error detection and correction</p>
		</div>
	</div>

	<div class="controls">
		<ul class="legend" aria-label="Legend">
			<li><i class="sw data"></i>Data bit</li>
			<li><i class="sw parity"></i>Parity bit</li>
			<!-- Overall parity bit legend is always rendered (but dimmed when SECDED is off) -->
			<li class:off={!secded} title={secded ? '' : 'Only used when SECDED is on'}><i class="sw overall"></i>Overall parity (p0)</li>
			<li><i class="sw ring flip"></i>Flipped by you</li>
			<li><i class="sw ring select"></i>Selected or corrected</li>
		</ul>

		<label class="switch" title="Single error correction, double error detection. Adds an overall parity bit for double error detection.">
			<input
				type="checkbox"
				checked={secded}
				onchange={(e) => {
					secded = e.currentTarget.checked;
					reset();	
				}}
			/>
			<span class="track" aria-hidden="true"></span>
			<span class="switch-text"><b>SECDED</b><small>Detects double errors</small></span>
		</label>
	</div>
</header>

<main>
	<section class="message">
		<div class="field">
			<label for="msg">Message</label>
			<div class="field-row">
				<input
				id="msg"
				type="text"
				maxlength="8"	
				autocomplete="off"
				spellcheck="false"
				value={text}
				oninput={(e) => {
					maybeOink(text, e.currentTarget.value);
					text = e.currentTarget.value;
					reset();
				}}
				/>
				<span class="count" class:over={byteLen > MAX_BYTES}>{byteLen} of {MAX_BYTES} bytes</span>
			</div>
			{#if byteLen > MAX_BYTES}
				<p class="field-note error">
					This is {byteLen} bytes in UTF-8 (accents and emojis use several bytes). The largest supported code is Hamming(71, 64),
					or Hamming(72, 64) with SECDED, which holds {MAX_BYTES} bytes.
				</p>
			{:else if byteLen == 0}
				<p class="field-note">Type a message to begin.</p>
			{/if}
		</div>

		{#if code}
			<div class="code-badge">
				<span class="cb-label">Code selected automatically</span>
				<span class="cb-value">Hamming({code.N},{code.k}){secded ? ' SECDED' : ''}</span>
				<span class="cb-sub">{code.k} data bits, {code.r} parity bits{secded ? ', 1 overall parity bit' : ''}</span>
			</div>
		{/if}
	</section>
	
	{#if code && res}
		<div class="steps">
			<!-- Step 1: Convert Text to Binary -->
			<Step num={1} title="Convert plaintext to binary" sub="Encode each character into its UTF-8 bytes, then express each byte using 8 bits">
				<div class="table-wrap">
					<table>
						<thead><tr><th>Character</th><th>Unicode</th><th>Bytes</th><th>Binary</th></tr></thead>
						<tbody>
							{#each rows as r}
								<tr>
									<td class="char">{r.ch.trim() ? r.ch : '␣'}</td>
									<td class="mono">U+{r.cp}</td>
									<td class="mono">{r.bytes.join(' ')}</td>
									<td class="mono">{r.bytes.map((b) => b.toString(2).padStart(8, '0')).join(' ')}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				
				<p class="stream-label">
					<b>Expected output</b> (Your message converted to one stream of {code.k} bits. This stream gets encoded in step 2.)
				</p>
				<div class="bytes" aria-label="Full bit stream, {code.k} bits">
					{#each allBytes as b}<span class="byte">{b.toString(2).padStart(8, '0')}</span>{/each}
				</div>
			</Step> 

			<!-- Step 2: Encode data with parity bits -->
			<Step num={2} title="Encode data with parity bits" sub={sub2}>
				<dl class="facts">					
					<div><dt>Data bits</dt><dd>{code.k}</dd></div>
					<div><dt>Parity bits</dt><dd>{code.r + (secded ? 1 : 0)}</dd><small>{code.r} Hamming{secded ? ' plus p0' : ''}</small></div>
					<div><dt>Codeword</dt><dd>{code.N}</dd><small>bits</small></div>
					<div><dt>Code rate</dt><dd>{Math.round((code.k / code.N) * 100)}%</dd><small>{code.k} of {code.N} bits are data</small></div>
				</dl>

				<div class="panel" onclick={(e) => clearIfOutside(e, () => (sel2 = null))}>
					<p class="hint">Select a parity bit to see what it checks, or a data bit to see which parity bits track it.</p>
					<BitGrid cells={cells2} interactive onselect={toggleSel2} label="Encoded codeword" />
					<p class="mini">{info2 ?? 'dk is the data bit at position k; pk is the parity bit at position k.'}</p>
				</div>
			</Step>

			<!-- Step 3: Corrupt the transmission by flipping bit(s) -->
			<Step
			 	num={3}
				title="Corrupt the transmission"
				sub="Click any bit to flip it. One flip is always corrected, two flips are detected with SECDED, and three or more flips can fool the code."
			>
				<div class="actions">
					<button class="btn" onclick={() => randomFlips(1)}>Flip 1 random bit</button>
					<button class="btn" onclick={() => randomFlips(2)}>Flip 2 random bits</button>
					<button class="btn ghost" onclick={() => (flips = [])} disabled={flips.length === 0}>Clear errors</button>
				</div>
				<div class="panel">
					<BitGrid cells={cells3} interactive onselect={flip} label="Received bits"/>
				</div>
				<p class="chip" class:bad={flips.length > 0}>
					{flips.length === 0 ? 'No bits flipped' : `${flips.length} ${flips.length === 1 ? 'bit' : 'bits'} flipped: ${flippedNames}`}
				</p>
			</Step>

			<!-- Step 4: Decode the transmission -->
			<Step num={4} title="Decode the received codeword" sub="Each failed parity check adds to the syndrome. The resulting sum points to the position of the flipped bit.">
				<div class="panel" onclick={(e) => clearIfOutside(e, () => (sel4=null))}>
					<p class="hint">The received word. Select a parity bit to see what it checks, or a data bit to see which parity bits track it.</p>
					<BitGrid cells={cells4} interactive onselect={toggleSel4} label="Received codeword"/>
					{#if info4}<p class="mini">{info4}</p>{/if}
				</div>

				<h3>Parity checks and syndrome</h3>
				<SyndromePanel {code} {res}/>

				<div class="verdicts">
					{#if secded}
						<div class="verdict {res.overall === 0 ? 'ok' : 'warn'}">
							<span class="vl">Overall parity</span>
							<span class="vv">{res.overall === 0 ? 'Even' : 'Odd'}</span>
							<span class="vs">XOR of all {code.N} bits is {res.overall}</span>
						</div>
					{/if}
					<div class="verdict {diagnosis.tone}">
						<div class="vl">
							Diagnosis
							<span class="tip-wrap">
								<button type="button" class="tip-btn" aria-describedby="diag-tip" aria-label="What determines the diagnosis?">?</button>
								<div class="tip" role="tooltip" id="diag-tip">
									<b class="tip-title">What determines the diagnosis?</b>
									<table class="rules">
										<thead>
											<tr>
												<th>Syndrome</th>
												{#if secded}<th>Overall parity</th>{/if}
												<th>Diagnosis</th>
											</tr>
										</thead>
										<tbody>
											{#each rules as r (r.key)}
												<tr class:active={r.key === res.status}>
													<td>{r.s}</td>
													{#if secded}<td>{r.o}</td>{/if}
													<td>{r.d}</td>
												</tr>
											{/each}
										</tbody>
									</table>
									<p class="tip-note">
										The syndrome is the weighted sum of the failed parity checks.
										{#if secded}The overall parity is based on whether the total number of 1s in the word is even.{/if}
										The highlighted row is the current result of the decoded codeword.
									</p>
								</div>
							</span>
						</div>
						<span class="vv">{diagnosis.title}</span>
						<span class="vs">{diagnosis.action}</span>
					</div>
				</div>

				{#if !secded && flips.length >= 2 && res.status === 'corrected'}
					<div class="banner warn">
						Without SECDED, a double error looks like a single one. This causes a correct bit to get "fixed". Turn on SECDED to see the difference.
					</div>
				{/if}

				<h3>Corrected word</h3>
				<div class="panel">
					<BitGrid cells={cellsFixed} label="Corrected codeword"/>
				</div>
				<p class="chip" class:ok={dataMatches} class:bad={!dataMatches}>
					{dataMatches ? 'Data bits match the original' : 'Data bits differ from the original'}
				</p>
			</Step>

			<!-- Step 5: Recover the message -->
			<Step num={5} title="Recover the message">
				<div class="out-box" aria-live="polite">{decodedText}</div>
				<div class="banner {outcome.tone}" aria-live="polite">{outcome.text}</div>
				<details>
					<summary>What you would read without error correction</summary>
					<div class="out-box small">{rawText}</div>
					<p class="mini">Data bits taken straight from the received word, ignoring all parity bits.</p>
				</details>
			</Step>
		</div>
	{/if}
</main>

<!-- Easter egg -->
{#if pigShow}
	{#key pigRun}<Pig onclose={() => (pigShow = false)}/>{/key}
{/if}

<footer>Copyright © 2026 Benjamin Goh Weijun. Released under the <a href="https://github.com/ben-boozled/Hamming_Code_Lab">MIT License</a>.</footer>