/**
 * @file Implementation of Hamming Code (including SECDED) logic.
 */

export const MAX_BYTES = 8; // 64 data bits -> Hamming(71, 64) or Hamming(72, 64) with SECDED

/**
 * @brief Calculates the bits per row in the codeword grids: 4, 8, or 16 (powers of 2) depending on word length 
 * 
 * @param {number} total The total number of bits in the codeword.
 * @returns {number} 4, 8, or 16
 */
export function perRow(total) {
    if (total <= 16) return 4;
    if (total <= 32) return 8;
    return 16;
}

/**
 * @brief Encodes a text using UTF-8 character encoding
 * 
 * @param {string} text The text to be encoded
 * @returns {object} An object containing the encoded bytes and bits of the text
 */
export function textToBits(text) {
    const bytes = new TextEncoder().encode(text);   // encode to bytes with UTF-8
    const bits = [];
    for (const b of bytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1); // using &i to extract each bit starting with the MSB
    return { bytes, bits };    // len(bits) = 8*len(bytes)
}

/**
 * @brief Decodes a flat array of 1s and 0s into text
 * 
 * @param {Array} bits The array of 1s and 0s to decode
 * @returns {string} The decoded text
 */
export function bitsToText(bits) {
    const out = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        let v = 0;  // stores the current byte for the bit-to-byte conversion
        for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; // OR operator to "concatenate" the next bit into the rightmost slot 
        out.push(v);
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(out)); // invalid bytes become U+FFFD
}

export const bstr = (bits) => bits.join('');
const xor = (list) => list.reduce((accumResult, currentBit) => accumResult ^ currentBit, 0) // XOR result of a list of bits

export const STATUS = {
    ok: { title: "No error", action: "The word is consistent. Nothing to fix.", tone: "ok"},
    corrected: { title: "Single-bit error", action: "Flipped back.", tone: "warn"},
    overall: { title: "Error in p0", action: "Flipped p0 back. The data is intact.", tone: "warn"},
    double: { title: "Double error", action: "Detected but not correctable.", tone: "err"},
    invalid: { title: "Multiple errors", action: "The syndrome points outside the word, meaning it annot be corrected.", tone: "err"},    
};

/**
 * @brief Creates a closure that computes the positions of the parity and data bits
 * 
 * @param {number} k The number of data bits
 * @param {bool} secded Selection status of SECDED mode
 * 
 * @return {object} Bit counts: k, r, n, N, offset, secded, fullK,
                    
                    Bit positions and statuses: parityPos, dataPos, parityIdx, dataIdx, names, kinds,
                    
                    Helper functions: idx, covered, encode, decode,
 */
export function createCode(k, secded) {
    let r = 2;  // the smallest number of parity bits required where 2^r >= k + r + 1
    while (2**r < k + r + 1) r++;

    const n = k + r;
    const offset = secded ? 1 : 0;
    const N = n + offset; // transmitted word length
    const idx = (position) => position - 1 + offset; // word index of a Hamming position

    const parityPos = Array.from( { length: r }, (_, i) => 1 << i );
    const dataPos = [];
    for (let p = 1; p <= n; p++) if (p & (p - 1)) dataPos.push(p);

    const names = []; // labels for bits
    const kinds = [];
    if (secded) {
        names.push('p0');
        kinds.push('overall');
    }
    for (let p = 1; p <= N; p++) {
        if (p & (p - 1)) {
            names.push(`d${p}`);
            kinds.push("data");
        } else {
            names.push(`p${p}`);
            kinds.push("parity");
        }
    }

    /* Positions checked by parity check number i */
    const covered = (i) => {
        const out = [];
        for (let p = 1; p <= n; p++) if ((p >> i) & 1) out.push(p);
        return out;
    };

    // Remap the index positions based on the SECDED mode 
    const parityIdx = parityPos.map(idx);
    const dataIdx = dataPos.map(idx)

    function encode(data) {
        const body = new Array(n).fill(0);
        dataPos.forEach((p, j) => (body[p - 1] = data[j])); // place data bits; the array is 0-based while data positions are 1-based
        parityPos.forEach((pp, i) => {
            body[pp - 1] = xor(covered(i).map((p) => body[p - 1]));
        }); // fill in the parity bits for even parity
        return secded ? [xor(body), ...body] : body; // overall parity bit if SECDED is enabled
    }

    function decode(word) {
        const body = word.slice(offset); // removes the first bit if SECDED is on
        const syndromeBits = parityPos.map((_, i) => xor(covered(i).map((p) => body[p - 1]))); // XORS the bits of each parity check
        const syndrome = syndromeBits.reduce((s, b, i) => s | (b << i), 0);  // "s | (b << i)" puts check i's result into bit i of the syndrome
        const overall = secded ? xor(word) : null;  // overall parity check

        let status;
        let errIdx = null;
        if (secded) {
            if (syndrome === 0 && overall === 0) status = 'ok';
            else if (syndrome === 0) [status, errIdx] = ['overall', 0]; // only p0 is wrong
            else if (overall === 1) {
                // odd number of errors, trust the syndrome if it is a real position
                if (syndrome <= n) [status, errIdx] = ['corrected', idx(syndrome)];
                else status = 'invalid';
            } else status = 'double';   // syndrome != 0 but overall parity is fine (i.e. even number of errors)
        } else if (syndrome === 0) status = 'ok';
        else if (syndrome <= n) [status, errIdx] = ['corrected', idx(syndrome)];
        else status = 'invalid';

        const corrected = word.slice();
        if (errIdx != null) corrected[errIdx] ^= 1;
        return {
            syndromeBits,
            syndrome,
            overall,
            status,
            errIdx,
            corrected,
            data: dataIdx.map((i) => corrected[i]),
        };
    }

    return {
        k, r, n, N, offset, secded,
        fullK: 2**r - r - 1, // data bits of the unshortened code
        parityPos, dataPos, parityIdx, dataIdx, names, kinds,
        idx, covered, encode, decode,
    };
}