/**
 * @file Tests the Hamming code logic.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createCode, textToBits, bitsToText } from './hamming.js';

// Makes an array of k random 0s and 1s for testing
const rand = (k) => Array.from({ length: k }, () => Math.round(Math.random()));

// Convert a string to bits and back; expects the original string to be returned
test('Round trip tests: text to bits = bits to text', () => {
    for (const s of ['Yerhoo!', 'Hello!', 'a', '你好吗']) assert.equal(bitsToText(textToBits(s).bits), s);
});

// Checks that the automatic Hamming code sizing gives the expected word lengths
test('Code size tests: (71,64) and (72,64) at the maximum', () => {
    assert.equal(createCode(64, false).N, 71);
    assert.equal(createCode(64,true).N, 72);
    assert.equal(createCode(56, true).N, 63);   // Hamming(63,56) is the size for the default message "Yerhoo!"
});

// Creates separate, named tests for each data size with SECDED on and off (total 10 test scenarios)
// Checks that every possible single-bit error in each test case is corrected
for (const secded of [false, true]) {
    for (const k of [8, 16, 24, 40, 64]) {
        test(`k=${k} secded=${secded} test: Clean word, with every possible single-bit error corrected`, () => {
            const code = createCode(k, secded);
            const data = rand(k);
            const word = code.encode(data);
            assert.equal(code.decode(word).status, 'ok');
            for (let i = 0; i < code.N; i++) {
                const bad = word.slice();
                bad[i] ^= 1;
                assert.deepEqual(code.decode(bad).data, data, `bit ${i}`);
            }
        });
    }
}

// Flips every possible pair of bits and expects the decoder to answer 'double' for all the errors
test('SECDED flags every double error test', () => {
    const code = createCode(24, true);
    const word = code.encode(rand(24));
    for (let i = 0; i < code.N; i++)
        for (let j = i + 1; j < code.N; j++) {
            const bad = word.slice();
            bad[i] ^= 1;
            bad[j] ^= 1;
            assert.equal(code.decode(bad).status, 'double');
    }
});