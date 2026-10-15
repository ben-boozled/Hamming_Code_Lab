/**
 * @file Implementations to turn a word plus a selection into the "cells" drawn by
 *       the BitGrid component.
 */

// Suffixes for position
const suffix = (i) => (i === 1 ? 'st' : i === 2 ? 'nd' : i == 3 ? 'rd' : 'th');

/**
 * @brief Turns a codeword plus a selection into a list of cells. Each cell says how
 *        that bit should be drawn (note: the drawing of the bit itself is done by
 *        BitGrid.svelte).
 * 
 * @param {object} code The object created from createCode()
 * @param {Array} word The array of 1s and 0s to display
 * @param {number} sel The word index of the selected bit or null
 * @returns {Array} An array with one object per bit describing how that bit should 
 *                  be drawn. The array comprises {i, value, label, kind, opacity, 
 *                  outline, glow}.
 */
export function coverageCells(code, word, sel) {
    const kind = sel === null ? null : code.kinds[sel]; // determine what kind of bit is selected
    const tracking = new Set();
    let covered = null;

    // if a data bit is selected, determing which parity bits track it
    if (kind === 'data') {
        const pos = sel - code.offset + 1;
        code.parityPos.forEach((_, i) => {
            if((pos >> i) & 1) tracking.add(code.parityIdx[i]);
        });
        if (code.secded) tracking.add(0); // p0 covers the whole word
    } else if (kind === 'parity') { // if a parity bit is selected, determine which data bits it checks
        covered = new Set(code.covered(code.parityIdx.indexOf(sel)).map((p) => code.idx(p)));
    }

    // builds one cell per bit
    return word.map((value, i) => {
        const isData = code.kinds[i] === 'data';
        const cell = { i, value, label: code.names[i], kind: code.kinds[i], opacity: 1, outline: null, glow: false };
        if (i === sel) {
            cell.outline = 'select';
            cell.glow = true;
        } else if (kind === 'data') {
            if(tracking.has(i)) cell.outline = 'select';
            else cell.opacity = isData ? 0.2 : 0.55; // non-selected parity bits to be more opaque than non-selected data bits
        } else if (kind === 'parity' && !covered.has(i)) {
            cell.opacity = isData ? 0.2 : 0.55;
        }
        return cell;
    });
}

/**
 * @brief Provides a one-line explanation of the currently selected bit.
 * 
 * @param {object} code The object created from createCode()
 * @param {number} sel The word index of the selected bit or null
 * @returns {String} The explanation of the selected bit.
 */
export function coverageInfo(code, sel) {
    if (sel === null) return null;
    const kind = code.kinds[sel];
    if (kind === 'overall') return 'p0 checks the whole word to make the total number of 1s even.'
    if (kind === 'parity') {
        const i = code.parityIdx.indexOf(sel);
        return `Bits where the binary form of their position number has bit ${i} (the ${i + 1}${suffix(i + 1)} digit from the right) set to 1.`
    }
    const pos = sel - code.offset + 1;
    const names = code.parityPos.filter((_, i) => (pos >> i) & 1).map((p) => `p${p}`);
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
    return `${code.names[sel]} is at position ${pos} (${pos.toString(2).padStart(code.r, '0')}₂). ${list} track${names.length === 1 ? 's' : ''} it${code.secded ? ', along with p0, the overall parity bit which tracks everything' : ''}.`;
}