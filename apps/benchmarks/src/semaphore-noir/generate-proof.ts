import * as V4 from "@semaphore-protocol/core"
// @ts-ignore
import { requireDefined, requireNumber, requireObject, requireTypes } from "@zk-kit/utils/error-handlers"

import type { BigNumberish } from "ethers"
import { type NumericString } from "snarkjs"
import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js"
import { MAX_DEPTH, MIN_DEPTH } from "./constant"
// Temporary import
import circuit from "./target/semaphore.json"
import hash from "./hash"
import toBigInt from "./to-bigint"
import type { SemaphoreProof } from "./types"
import { toHex } from "./toHex"

/**
 * It generates a Semaphore proof, i.e. a zero-knowledge proof that an identity that
 * is part of a group has shared an anonymous message.
 * The message may be any arbitrary user-defined value (e.g. a vote), or the hash of that value.
 * The scope is a value used like a topic on which users can generate a valid proof only once,
 * for example the id of an election in which voters can only vote once.
 * The hash of the identity's scope and secret scalar is called a nullifier and can be
 * used to verify whether that identity has already generated a valid proof in that scope.
 * The depth of the tree determines which zero-knowledge artifacts to use to generate the proof.
 * If it is not defined, it will be inferred from the group or Merkle proof passed as the second parameter.
 * Finally, the artifacts themselves can be passed manually with file paths,
 * or they will be automatically fetched.
 * Please keep in mind that groups with 1 member or 2 members cannot be considered anonymous.
 * @param identity The Semaphore identity.
 * @param groupOrMerkleProof The Semaphore group or its Merkle proof.
 * @param message The Semaphore message.
 * @param scope The Semaphore scope.
 * @param merkleTreeDepth The depth of the tree with which the circuit was compiled.
 * @param snarkArtifacts See {@link https://zkkit.pse.dev/interfaces/_zk_kit_utils.SnarkArtifacts.html | SnarkArtifacts}.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    identity: V4.Identity,
    groupOrMerkleProof: V4.Group | V4.MerkleProof,
    message: BigNumberish | Uint8Array | string,
    scope: BigNumberish | Uint8Array | string,
    merkleTreeDepth?: number
): Promise<SemaphoreProof> {
    requireDefined(identity, "identity")
    requireDefined(groupOrMerkleProof, "groupOrMerkleProof")
    requireDefined(message, "message")
    requireDefined(scope, "scope")

    requireObject(identity, "identity")
    requireObject(groupOrMerkleProof, "groupOrMerkleProof")
    requireTypes(message, "message", ["string", "bigint", "number", "Uint8Array"])
    requireTypes(scope, "scope", ["string", "bigint", "number", "Uint8Array"])

    if (merkleTreeDepth) {
        requireNumber(merkleTreeDepth, "merkleTreeDepth")
    }

    // Message and scope can be strings, numbers or buffers (i.e. Uint8Array).
    // They will be converted to bigints anyway.
    message = toBigInt(message)
    scope = toBigInt(scope)

    let merkleProof

    // The second parameter can be either a Merkle proof or a group.
    // If it is a group the Merkle proof will be calculated here.
    if ("siblings" in groupOrMerkleProof) {
        merkleProof = groupOrMerkleProof
    } else {
        const leafIndex = groupOrMerkleProof.indexOf(identity.commitment)
        merkleProof = groupOrMerkleProof.generateMerkleProof(leafIndex)
    }

    const merkleProofLength = merkleProof.siblings.length

    // TODO: fix
    const DEFAULT_TREE_DEPTH = 32

    if (merkleTreeDepth !== undefined) {
        if (merkleTreeDepth < MIN_DEPTH || merkleTreeDepth > MAX_DEPTH) {
            throw new TypeError(`The tree depth must be a number between ${MIN_DEPTH} and ${MAX_DEPTH}`)
        }
    } else {
        merkleTreeDepth = merkleProofLength !== 0 ? merkleProofLength : DEFAULT_TREE_DEPTH
    }

    // TODO: implement this
    // If the Snark artifacts are not defined they will be automatically downloaded.
    // snarkArtifacts ??= await maybeGetSnarkArtifacts(Project.SEMAPHORE, {
    //     parameters: [merkleTreeDepth],
    //     version: "4.0.0"
    // })
    // const { wasm, zkey } = snarkArtifacts

    // The index must be converted to a list of indices, 1 for each tree level.
    // The missing siblings can be set to 0, as they won't be used in the circuit.
    const merkleProofIndices = []

    // TODO: change as immutable
    const merkleProofSiblings = merkleProof.siblings

    for (let i = 0; i < merkleTreeDepth; i += 1) {
        merkleProofIndices.push((merkleProof.index >> i) & 1)

        if (merkleProofSiblings[i] === undefined) {
            merkleProofSiblings[i] = 0n
        }
    }

    const noir = new Noir(circuit as any)
    const honk = new UltraHonkBackend(circuit.bytecode, {
        threads: 1
    })

    // FIXME : indexes?
    const inputs = {
        indexes: toHex(parseInt(merkleProofIndices.reverse().join(""), 2), 64),
        message: hash(message),
        paths: {
            len: merkleProofLength,
            storage: merkleProof.siblings
                .map((sibling) => sibling.toString())
                .concat(Array<string>(DEFAULT_TREE_DEPTH - merkleProof.siblings.length).fill("0"))
        },
        scope: hash(scope),
        secret: identity.secretScalar.toString()
    }

    const { witness } = await noir.execute(inputs)
    const { publicInputs, proof } = await honk.generateProof(witness, {
        keccak: true
    })

    return {
        merkleTreeDepth,
        merkleTreeRoot: merkleProof.root.toString(),
        nullifier: publicInputs[3],
        message: message.toString() as NumericString,
        scope: scope.toString() as NumericString,
        proof,
        publicInputs
    }
}
