import { Box, Button, Flex, Heading, List, ListIcon, ListItem, Text } from "@chakra-ui/react"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import * as V4 from "@semaphore-protocol/core"
import { generateProof, verifyProof } from "@semaphore-protocol/proof"
import { verifyProof as verifyProofV4Noir } from "semaphore-proof-noir-test-proof"

import { useCallback, useState } from "react"
import { MdCheckCircle } from "react-icons/md"
import initNoirC from "@noir-lang/noirc_abi"
import initACVM from "@noir-lang/acvm_js"
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url"
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url"
// TODO: use generateProof of 'semaphore-proof-noir-test-proof',
// TODO: for now, the wasm is not loaded within this module when generateProof
import generateProofV4Noir from "./semaphore-noir/generate-proof"
import TreeDepth from "./components/TreeDepth"
import Navbar from "./components/Navbar"
import GroupMembers from "./components/GroupMembers"

// https://noir-lang.org/docs/tutorials/noirjs_app#some-more-js
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))])

const functions = ["new Identity", "new Group", "generateProof", "verifyProof", "addMember", "updateMember"]

function App() {
    const [v3treeDepth, setV3TreeDepth] = useState<number>(20)
    const [v3GroupMembers, setV3GroupMembers] = useState<number>(100)
    const [v4GroupMembers, setV4GroupMembers] = useState<number>(100)
    const [v3Times, setV3Times] = useState<number[]>([])
    const [v4Times, setV4Times] = useState<number[]>([])

    const [v4NoirGroupMembers, setV4NoirGroupMembers] = useState<number>(100)
    const [v4NoirTimes, setV4NoirTimes] = useState<number[]>([])

    async function run(callback: () => any): Promise<[any, number]> {
        const t0 = performance.now()

        const result = await callback()

        const t1 = performance.now()

        return [result, t1 - t0]
    }

    const runV3Functions = useCallback(async () => {
        const timeValues = []

        const [identity, time0] = await run(() => new Identity())

        timeValues.push(time0)

        setV3Times(timeValues)

        let members = Array.from(Array(v3GroupMembers - 1).keys())
        members = [...members, identity.commitment]

        const [group, time1] = await run(() => new Group(1, v3treeDepth, members))

        timeValues.push(time1)

        setV3Times(timeValues.slice())

        const [proof, time2] = await run(async () => generateProof(identity, group, 1, 1))

        timeValues.push(time2)

        setV3Times(timeValues.slice())

        const [, time3] = await run(async () => verifyProof(proof, v3treeDepth))

        timeValues.push(time3)

        setV3Times(timeValues.slice())

        const [, time4] = await run(() => {
            group.addMember(1)
        })

        timeValues.push(time4)

        setV3Times(timeValues.slice())

        const [, time5] = await run(() => {
            group.updateMember(0, 1)
        })

        timeValues.push(time5)

        setV3Times(timeValues.slice())
    }, [v3treeDepth, v3GroupMembers])

    const runV4Functions = useCallback(async () => {
        const timeValues = []

        const [identity, time0] = await run(() => new V4.Identity())

        timeValues.push(time0)

        setV4Times(timeValues)

        let members = Array.from(Array(v4GroupMembers - 1).keys()).map((m) => BigInt(m) + 1n)
        members = [...members, identity.commitment]

        const [group, time1] = await run(() => new V4.Group(members))

        timeValues.push(time1)

        setV4Times(timeValues.slice())

        const [proof, time2] = await run(async () => V4.generateProof(identity, group, 1, 1))

        timeValues.push(time2)

        setV4Times(timeValues.slice())

        const [, time3] = await run(async () => V4.verifyProof(proof))

        timeValues.push(time3)

        setV4Times(timeValues.slice())

        const [, time4] = await run(() => {
            group.addMember(1)
        })

        timeValues.push(time4)

        setV4Times(timeValues.slice())

        const [, time5] = await run(() => {
            group.updateMember(0, 2n)
        })

        timeValues.push(time5)

        setV4Times(timeValues.slice())
    }, [v4GroupMembers])

    const runV4NoirFunctions = useCallback(async () => {
        const timeValues = []

        const [identity, time0] = await run(() => new V4.Identity())

        timeValues.push(time0)

        setV4NoirTimes(timeValues)

        let members = Array.from(Array(v4NoirGroupMembers - 1).keys()).map((m) => BigInt(m) + 1n)
        members = [...members, identity.commitment]

        const [group, time1] = await run(() => new V4.Group(members))

        timeValues.push(time1)

        setV4NoirTimes(timeValues.slice())

        const [proof, time2] = await run(async () => generateProofV4Noir(identity, group, 1, 1))

        timeValues.push(time2)

        setV4NoirTimes(timeValues.slice())

        const [, time3] = await run(async () => verifyProofV4Noir(proof))

        timeValues.push(time3)

        setV4NoirTimes(timeValues.slice())

        const [, time4] = await run(() => {
            group.addMember(1)
        })

        timeValues.push(time4)

        setV4NoirTimes(timeValues.slice())

        const [, time5] = await run(() => {
            group.updateMember(0, 2n)
        })

        timeValues.push(time5)

        setV4NoirTimes(timeValues.slice())
    }, [v4NoirGroupMembers])

    return (
        <Flex flexDir="column" flex="1">
            <Navbar />
            <Flex flex="1" align="center" justify="center">
                <Flex gap={10}>
                    <Flex flexDir="column" gap={4} width="300px">
                        <Heading as="h3" size="lg">
                            Semaphore v3
                        </Heading>
                        <TreeDepth value={v3treeDepth} onChange={setV3TreeDepth} />
                        <GroupMembers value={v3GroupMembers} onChange={setV3GroupMembers} max={2 ** v3treeDepth} />

                        <Button onClick={() => runV3Functions()} size="sm" my="3">
                            Run functions
                        </Button>

                        <List spacing={3}>
                            {functions.map((f, i) => (
                                <ListItem key={f}>
                                    <Flex justify="space-between">
                                        <Box>
                                            {v3Times[i] && <ListIcon as={MdCheckCircle} color="green.500" />}
                                            <b>{f}</b>
                                        </Box>
                                        <Text>{v3Times[i] ? v3Times[i] : 0} ms</Text>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>
                    </Flex>
                    <Flex flexDir="column" gap={4} width="300px">
                        <Heading as="h3" size="lg" mb="12">
                            Semaphore v4
                        </Heading>

                        <GroupMembers value={v4GroupMembers} onChange={setV4GroupMembers} max={2 ** 32} />

                        <Button onClick={() => runV4Functions()} size="sm" my="3">
                            Run functions
                        </Button>

                        <List spacing={3}>
                            {functions.map((f, i) => (
                                <ListItem key={f}>
                                    <Flex justify="space-between">
                                        <Box>
                                            {v4Times[i] && <ListIcon as={MdCheckCircle} color="green.500" />}
                                            <b>{f}</b>
                                        </Box>
                                        <Text>{v4Times[i] ? v4Times[i] : 0} ms</Text>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>
                    </Flex>

                    <Flex flexDir="column" gap={4} width="300px">
                        <Heading as="h3" size="lg" mb="12">
                            Semaphore v4 Noir
                        </Heading>

                        <GroupMembers value={v4NoirGroupMembers} onChange={setV4NoirGroupMembers} max={2 ** 32} />

                        <Button onClick={() => runV4NoirFunctions()} size="sm" my="3">
                            Run functions
                        </Button>

                        <List spacing={3}>
                            {functions.map((f, i) => (
                                <ListItem key={f}>
                                    <Flex justify="space-between">
                                        <Box>
                                            {v4NoirTimes[i] && <ListIcon as={MdCheckCircle} color="green.500" />}
                                            <b>{f}</b>
                                        </Box>
                                        <Text>{v4NoirTimes[i] ? v4NoirTimes[i] : 0} ms</Text>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default App
