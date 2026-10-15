# Introduction
Hamming codes are a simple way to introduce resiliency in data transmission through the addition of parity bits. They enable the correction of single-bit errors and, in their extended form, the detection of double-bit errors. Broadly speaking, there are two ways to encode and decode Hamming codes:
1. Parity equations (the more intuitive approach).
2. Linear algebra (works better for larger code block sizes).

Both approaches describe the same concepts using different notations.

# Approach 1: Parity Equations
The first approach directly computes the XOR result of various parity equations. This method is implemented by the interactive web application. To understand how this approach works, the subsequent sections answer the following questions:
- How is the code block size determined?
- What are parity checks?
- What is a syndrome?

## How is the Code Block Size Determined?
In Hamming codes, the original message is split into multiple fixed-size chunks called code blocks. Each code block comprise the binary bits of the original message and additional parity bits added during the encoding process. The size of a Hamming code block is expressed as Hamming($$n$$, $$k$$) where $$n$$ is the total number of bits and $$k$$ is the total number of data bits. For single-bit error correction, the number of parity bits required is the minimum $$r$$ that satisfies the relationship below:

$$
2^{r} \geq k + r + 1
$$

In the extended Hamming code with SECDED (single error correction, double error detection), an additional parity bit for the entire block is added, bringing the total number of parity bits to $$r + 1$$.

> [!Note]
> In standard Hamming codes, $$n = 2^{r} - 1$$ because this value of $$n$$ is based on the maximum number of $$k$$ data bits that can be supported by $$r$$ parity bits. The Hamming code web application limits the encoded message to take in whole bytes and expresses the entire message in a single code block; the number of data bits will always be a multiple of 8. As such, the web application produces a shortened Hamming code and defines $$n$$ as $$n = k + r$$ instead.  

## What are Parity Checks?
A parity check is an error detection method that encodes an extra bit into a binary string. Depending on the parity mode, this extra bit will be either a 1 or 0 to ensure that the total number of 1s in the string is always even (also known as even parity) or odd (also known as odd parity). The sender is responsible for toggling the parity bits. The Hamming code web application of this repository uses **even parity checks**.

To pass an even parity check:
- The **XOR** of all the bits in the coverage area, including the relevant parity bit, must equal to 0.
- A mathematical equivalent to the above is to sum up all the bits and verify that the **modulo 2** of this sum equals to 0.

### Hamming Parity Bits
Parity bits detect whether there is an error (i.e. a bit flip) in the message. Hamming code expands the use of parity bits by having multiple parity bits check different subsets of the message. This helps the receiver pinpoint the location of an error by (1) determining which parity checks fail followed by (2) finding the overlap of their coverage areas.

All Hamming parity bits are located at positions that are powers of 2. The bits they check depend on the binary representation of their position numbers. For instance, in the image below, the parity bit at position 2 (equivalent to $$00000010_{2}$$) has a $$1$$ in its 2nd bit (counting from the right). Hence, all positions with a 1 in the 2nd bit of their binary representation will be checked by this parity bit.

<div align="center">
  <img src="https://github.com/ben-boozled/Hamming_Code_Lab/raw/main/Images/p2_Parity_Coverage.png" alt="p2 parity coverage area" width="600">
</div>

### Overall Parity Bit
If SECDED is enabled, an additional parity bit at position $p0$ is added to verify the parity of the entire block. After setting the individual Hamming parity bits, this overall parity bit is set to make the parity of the entire code block even.

## What is a Syndrome?
The syndrome is a bit pattern calculated by the decoder (on the receiver's end) to detect whether any errors have corrupted the message during transmission. 

**Single-bit Error**

In the case of a single-bit error, the syndrome indicates the location of the error. For instance, for a single-bit error at position 37 of the code block, the syndrome is computed as follows: 

<div align="center">
  <img src="https://github.com/ben-boozled/Hamming_Code_Lab/raw/main/Images/Syndrome_Error_at_37_Result.png" alt="Syndrome result for error at position 37" width="600">
</div>

As shown from the above, by taking the weighted sum of the failed parity checks (or reading the parity check results in reverse i.e. $0100101_{2}$), the syndrome returns the position of the single bit error, allowing the decoder to correct that error.

**Double-bit Errors**

When used in tandem with the overall parity bit at $p0$, the syndrome supports the detection of double-bit errors (though it will not be able to pinpoint exactly where those errors are). The table below summarises how to diagnose the code based on the syndrome's result and the overall block parity:

| Syndrome | Overall Block Parity | Diagnosis                |
| -------- | -------------- | ------------------------------ |
| 0        | Even           | No error.                      |
| 0        | Odd            | Error in $p0$ only. Corrected. |
| 1 to $n$ | Odd            | Single-bit error at that position. Corrected. |
| Not 0    | Even           | Double errors. Detected but not correctable. |
| Above $n$| Odd            | Multiple errors. Detected but not correctable. |

Since 2 bit flips causes the overall block parity to remain even, an even block parity along with a non-zero syndrome is an indication of 2 errors.

> [!IMPORTANT]
> The Hamming distance, $d_{min}$, is the minimum number of bit flips required to change one valid codeword into another. The standard Hamming code (without SECDED) has $d_{min}=3$ while the extended Hamming code (with SECDED) has $d_{min}=4$.
> 
> The relationship between Hamming distance, error correction capability ($t$), and error detection capability ($s$) is: $d_{min} \geq s + t + 1$.
> 
> In the extended Hamming code, $t=1$ which means the maximum error detection capability is $s=2$. For 3 bit flips or more, the extended Hamming code will fail because (a) 3 bit flips causes the received vector to land on another valid codeword; (b) 4 bit flips causes the received codeword to land _closer_ to a different neighbouring codeword, causing the decoder to "correct" the error to the wrong codeword.

## Project Implementation
For the web application, I implemented the `encode()` function in `hamming.js` by performing the following steps:
1. Sequentially assign data bits to non-powers of two positions, starting with the most significant bit of the data.
2. Calculate the Hamming parity bits based on XOR result of their respective coverage areas.
3. Calculate the overall parity bit based on XOR result of the entire block.

Similarly, the `decode()` function in `hamming.js` performed the reverse:
1. Take the XOR result of the overall parity bit and the entire block.
2. Take the XOR result of each Hamming parity bit and their coverage area.
3. Calculate the syndrome and use the overall block parity to determine the final diagnosis.

# Approach 2: Linear Algebra
Since Hamming codes are linear codes, it is also common practice to use linear algebra tools (i.e. matrices and vectors) to compute them. Although this method is not implemented in the project code, I think it is worth covering this topic to provide another perspective on understanding Hamming codes. 

An overview of the communication process is shown here:

<div align="center">
  <img src="https://github.com/ben-boozled/Hamming_Code_Lab/raw/main/Images/Sender_Receiver_Overview.png" alt="Communication process overview" width="600">
</div>

The key matrices in the diagram above are as follows:
- The generator matrix $\mathbf{G_{k×n}}$ is used by the **sender** to encode the message into the code block.
- The parity-check matrix $\mathbf{H_{r×n}}$ is used by the **receiver** to perform syndrome decoding for error detection and correction.
- The error vector $e_{1×n}$ represents any corruptions (bit flips) to the message.

To better illustrate the ideas in the subsequent sections, I will use an example message. Suppose the message is the letter "A". Using UTF-8 encoding, the binary representation of the message is $01000001_2$, where $$k = 8$$. This means:
- The number of parity bits is $$r = 4$$ because it is the smallest value that satisfies $$2^{r} \geq k + r + 1$$.
- With SECDED enabled, the total number of bits $$n = r + k + 1 = 4 + 8 + 1 = 13$$.
- Hence, the code block size of this shortened Hamming code is **(13, 8)**.

>[!IMPORTANT]
>In the subsequent derivations, note that the parity-check matrix $H$ and generator matrix $G$ are independent of the message to be encoded. $H$ and $G$ only depend on the structure of the code block:
> - How many data bits? 8.
> - How many parity bits? 5. 
> - Where are the parity bits located? Positions 0, 1, 2, 4, and 8.

## Parity-check Matrix
The parity-check matrix $\mathbf{H_{r×n}}$ maps an $n$-bit received codeword vector $r^{T}_{n×1}$ into an $r$-bit syndrome vector $s\_{r×1}$  via matrix multiplication modulo 2:

$$
s_{r×1} = H_{r×n}·r^{T}_{n×1} = H_{r×n}·e^{T}_{n×1}
$$

> [!CAUTION]
> The $r$ in the syndrome vector $s\_{r×1}$ refers to the number of parity bits in the codeword. On the other hand, the received codeword vector $r_{1×n}$ refers to the received codeword of length $n$ bits.

**Step 1: Derive the Hamming parity bits portion of H.**

We want the syndrome to return an address such that if there is one bit flip in $e_{1×n}$, the syndrome will equal to that bit's column (e.g. if the 5th bit of $e$ flips, $s = H·e^{T}$ will return $0101\_{2}$). Hence, $H\_{5×13}$ should be built such that its $i$-th column contains the number $i$.

Without SECDED, there are 12 bits in the code block. Hence, the Hamming parity bit portion of the parity-check matrix should have each column counting in binary from 1 to 12. 

$$
\\mathbf{HammingPortion_{4×12}} = \begin{bmatrix}1 & 0 & 1 & 0 & 1 & 0 & 1 & 0 & 1 & 0 & 1 & 0 \\\\ 
                                                 0 & 1 & 1 & 0 & 0 & 1 & 1 & 0 & 0 & 1 & 1 & 0 \\\\ 
                                                 0 & 0 & 0 & 1 & 1 & 1 & 1 & 0 & 0 & 0 & 0 & 1 \\\\ 
                                                 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 1 & 1 & 1 & 1 \end{bmatrix}
$$

Row 1 of the matrix represents the parity checks by the $p1$ Hamming parity bit, row 2 the $p2$ Hamming parity bit, and so on.

**Step 2: Include the column and row for SECDED.**

Append a 13th column of pure 0s followed by a a 5th row of pure 1s that will check all 13 bits. These additions represent the checks by the overall $p0$ parity bit and give us the final parity-check matrix:

$$
\\mathbf{H_{5×13}} = \begin{bmatrix}1 & 0 & 1 & 0 & 1 & 0 & 1 & 0 & 1 & 0 & 1 & 0 & 0 \\\\ 
                                    0 & 1 & 1 & 0 & 0 & 1 & 1 & 0 & 0 & 1 & 1 & 0 & 0 \\\\ 
                                    0 & 0 & 0 & 1 & 1 & 1 & 1 & 0 & 0 & 0 & 0 & 1 & 0 \\\\ 
                                    0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 1 & 1 & 1 & 1 & 0 \\\\
                                    1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 \end{bmatrix}
$$

## Generator Matrix
The generator matrix $\mathbf{G_{k×n}}$ maps a $k$-bit message $m$ into an $n$-bit codeword via matrix multiplication modulo 2:

$$
c_{1×n} = m_{1×k}·G_{k×n}
$$

**The $i$-th row of $G$ answers the question: "how would the whole codeword look like if the $i$-th data bit is the only bit set to 1 in the message?"**

To answer this, we must first understand that each data bit affects the codeword by going through the following steps in sequence:
1. Add a 1 to its own position.
2. Add a 1 to every Hamming parity bit that watches its position (for even parity).
3. Add a 1 at the overall parity bit $p0$ **only if required** to make the row's total weight even.

>[!NOTE]
>As an example, the 5th data bit in $m_{1×k}$ is:
>1. Located at position 9, $1001\_{2}$, in the code block. Hence, we add a 1 to the 9th column.
>2. Tracked by Hamming parity bits $p1$ and $p8$. Hence we add a 1 to the 1st and 8th column.
>3. The total number of 1s from the previous two steps is 3 (an odd number). For even parity, the 13th column representing $p0$ needs to be 1.
>
>Therefore, the 5th row of $G$ looks like this:
>
>$$
\begin{bmatrix} 1 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 1 & 0 & 0 & 0 & 1 \end{bmatrix} 
$$

With the above logic in mind, every row of G can be formed to give the complete generator matrix:

$$
\\mathbf{G_{8×13}} = \begin{bmatrix} 1 & 1 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\\\ 
                                     1 & 0 & 0 & 1 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\\\
                                     0 & 1 & 0 & 1 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\\\ 
                                     1 & 1 & 0 & 1 & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                                     1 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 1 & 0 & 0 & 0 & 1 \\\\
                                     0 & 1 & 0 & 0 & 0 & 0 & 0 & 1 & 0 & 1 & 0 & 0 & 1 \\\\
                                     1 & 1 & 0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 & 1 & 0 & 0 \\\\
                                     0 & 0 & 0 & 1 & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 1 & 1 \end{bmatrix}
$$

>[!IMPORTANT]
>As a sanity check, ensure that $G·H^{T}=0$. This expression takes the dot product modulo 2 of row $i$ of $G$ (representing a valid codeword) with column $j$ of $H$ (representing the corresponding parity checks). Every row of $G$ is built to pass the relevant parity checks. Hence, the dot product $G·H^{T}$ should equal to 0.
>
>The above relationship regarding valid codewords producing 0 when multiplied with $H$ is also why $s = H·r^{T} = H·c^{T} \oplus H·e^{T} = H·e^{T}$

## Demonstration
For the message "A", the message vector is: 

$$
m_{1×8} = \begin{bmatrix} 0 & 1 & 0 & 0 & 0 & 0 & 0 & 1 \end{bmatrix}
$$

Using $G$, the encoded message $c$ is the XOR of row 2 and row 8 in $G$:

$$
c_{1×13} = m·G = \begin{bmatrix} 1 & 0 & 0 & 0 & 1 & 0 & 0 & 1 & 0 & 0 & 0 & 1 & 1 \end{bmatrix}
$$

### No Error
When there are no errors, the received message is:

$$
r_{1×13} = \begin{bmatrix} 1 & 0 & 0 & 0 & 1 & 0 & 0 & 1 & 0 & 0 & 0 & 1 & 1 \end{bmatrix}
$$

Hence,

$$
s_{5×1} = H·r^{T} = \begin{bmatrix} 0 & 0 & 0 & 0 & 0 \end{bmatrix}^{T}
$$

The returned value is a zero vector, meaning there are no errors.

### Single-bit Error
For a single-bit error (e.g. the 5th data bit at position 9), the received message is:

$$
r_{1×13} = \begin{bmatrix} 1 & 0 & 0 & 0 & 1 & 0 & 0 & 1 & 1 & 0 & 0 & 1 & 1 \end{bmatrix}
$$

The calculated syndrome will be:

$$
s_{5×1} = H·r^{T} = \begin{bmatrix} 1 & 0 & 0 & 1 & 1 \end{bmatrix}^{T}
$$

The first 4 bits when **reversed** read $1001_{2}$ which equals to 9 in binary. The last bit in $s$ represents the overall parity bit; the value of $1$ means the overall block parity is odd. Using the [diagnosis lookup table](https://github.com/ben-boozled/Hamming_Code_Lab/blob/main/Hamming_Code_Math.md#what-is-a-syndrome) for the syndrome, these results mean there is a single bit error at position 9. The decoder will flip the bit at position 9 of $r$ to ensure the receiver receives the original $c$.

### Double-bit Error
For a double-bit error (e.g. at positions 3 and 6), the received message is:

$$
r_{1×13} = \begin{bmatrix} 1 & 0 & 1 & 0 & 1 & 1 & 0 & 1 & 0 & 0 & 0 & 1 & 1 \end{bmatrix}
$$

The calculated syndrome will be:

$$
s_{5×1} = H·r^{T} = \begin{bmatrix} 1 & 0 & 1 & 0 & 0 \end{bmatrix}^{T}
$$

The first 4 bits when **reversed** read $0101_{2}$ which equals to 5 in binary. However, the overall parity bit is $0$ because two bit flips will still result in an even parity. Using the [diagnosis lookup table](https://github.com/ben-boozled/Hamming_Code_Lab/blob/main/Hamming_Code_Math.md#what-is-a-syndrome), these results tell the decoder there is a double-bit error that is not correctable.
