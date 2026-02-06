# Test Inputs

Place test input JSON files here for circuit testing.

## Example Input Format

```json
{
  "secret": "1234567890",
  "nullifier": "9876543210",
  "pathElements": ["0", "0", "... 24 items total ..."],
  "pathIndices": [0, 1, 0, "... 24 items total ..."],
  "root": "12345678901234567890",
  "recipient": "1",
  "fee": "0",
  "relayer": "0"
}
```

Notes:
- All values should be **field elements / uint256** encoded as **decimal strings** (recommended).
- `pathElements` and `pathIndices` must be length **24** (the circuit is compiled with 24 levels).
- `recipient` / `relayer` are uint256 (e.g. Ethereum addresses can be provided as their 160-bit value in decimal).

These inputs are used for:
- Testing circuit compilation
- Generating test proofs
- Verifying circuit correctness

