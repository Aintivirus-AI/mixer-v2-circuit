const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const { buildPoseidon } = require("circomlibjs");

async function testCircuit() {
    console.log("Testing Mixer Circuit...\n");

    const LEVELS = 24;

    // Check if build files exist
    const wasmPath = path.join(__dirname, "../build/mixer_js/mixer.wasm");
    const zkeyPath = path.join(__dirname, "../build/mixer_0001.zkey");
    const inputPath = path.join(__dirname, "../inputs/example_input.json");

    if (!fs.existsSync(wasmPath)) {
        console.error("Error: Circuit not compiled. Run 'npm run compile' first.");
        return;
    }

    if (!fs.existsSync(zkeyPath)) {
        console.error("Error: Trusted setup not generated. Run the setup commands first.");
        return;
    }

    if (!fs.existsSync(inputPath)) {
        console.log("Input file not found. Generating a deterministic example input...");

        const poseidon = await buildPoseidon();
        const F = poseidon.F;

        const toFieldString = (x) => F.toObject(x).toString();
        const hash2 = (a, b) => poseidon([BigInt(a), BigInt(b)]);

        // Deterministic demo values (do NOT use in production)
        const secret = 1n;
        const nullifier = 2n;

        const commitment = hash2(secret, nullifier);
        let cur = commitment;

        const pathElements = [];
        const pathIndices = [];
        for (let i = 0; i < LEVELS; i++) {
            // leaf/hash is always on the left, sibling is 0 on the right
            pathElements.push("0");
            pathIndices.push(0);
            cur = hash2(F.toObject(cur), 0n);
        }

        const input = {
            secret: secret.toString(),
            nullifier: nullifier.toString(),
            pathElements,
            pathIndices,
            root: toFieldString(cur),
            recipient: "1",
            fee: "0",
            relayer: "0"
        };

        fs.mkdirSync(path.dirname(inputPath), { recursive: true });
        fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));
        console.log("Example input written to:", inputPath);
    }

    // Load input
    const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    console.log("Input loaded:", input);

    // Generate witness
    console.log("\nGenerating witness...");
    const witnessCalculatorBuilder = require(path.join(__dirname, "../build/mixer_js/witness_calculator"));
    const wasm = fs.readFileSync(wasmPath);
    const witnessCalculator = await witnessCalculatorBuilder(wasm);
    const witness = await witnessCalculator.calculateWTNSBin(input, 0);
    const witnessPath = path.join(__dirname, "../build/witness.wtns");
    fs.writeFileSync(witnessPath, witness);
    console.log("Witness generated!");

    // Generate proof
    console.log("\nGenerating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyPath, witnessPath);
    console.log("Proof generated!");

    // Save proof and public signals
    const proofPath = path.join(__dirname, "../build/proof.json");
    const publicPath = path.join(__dirname, "../build/public.json");
    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));
    console.log("\nProof saved to:", proofPath);
    console.log("Public signals saved to:", publicPath);

    // Verify proof
    console.log("\nVerifying proof...");
    const vkey = JSON.parse(fs.readFileSync(path.join(__dirname, "../build/verification_key.json"), "utf8"));
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    
    if (verified) {
        console.log("✓ Proof verified successfully!");
        console.log("\nPublic Signals:");
        console.log("  [0] nullifierHash:", publicSignals[0]);
        console.log("  [1] recipientAddress:", publicSignals[1]);
        console.log("  [2] root:", publicSignals[2]);
        console.log("  [3] fee:", publicSignals[3]);
        console.log("  [4] relayer:", publicSignals[4]);
    } else {
        console.error("✗ Proof verification failed!");
    }
}

testCircuit().catch(console.error);

