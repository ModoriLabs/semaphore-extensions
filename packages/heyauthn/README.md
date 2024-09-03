<p align="center">
    <h1 align="center">
        HeyAuthn
    </h1>
    <p align="center">A library to allow developers to create and manage Semaphore identities using WebAuthn.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/extensions/blob/main/packages/heyauthn/LICENSE">
        <img alt="NPM License" src="https://img.shields.io/npm/l/%40semaphore-extensions%2Fheyauthn">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-extensions/heyauthn">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/%40semaphore-extensions%2Fheyauthn">
    </a>
    <a href="https://npmjs.org/package/@semaphore-extensions/heyauthn">
        <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/%40semaphore-extensions%2Fheyauthn">
    </a>
    <a href="https://semaphore-protocol.github.io/extensions/classes/HeyAuthn.html">
        <img alt="Documentation typedoc" src="https://img.shields.io/badge/docs-typedoc-744C7C?style=flat-square">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://github.com/semaphore-protocol/extensions/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/extensions/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/extensions/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.pse.dev/telegram">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This library allows developers to create and manage Semaphore identities using [WebAuthn](https://webauthn.io/) as a cross-device biometric authentication in a way that is more convenient, smoother and secure than localStorage, Chrome extensions, or password manager based solutions. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

### npm or yarn

Install the `@semaphore-extensions/heyauthn` package with npm:

```bash
npm i @semaphore-extensions/heyauthn
```

or yarn:

```bash
yarn add @semaphore-extensions/heyauthn
```

## 📜 Usage

For more information on the functions provided by `@semaphore-extensions/heyauthn`, please refer to the [TypeDoc documentation](https://semaphore-protocol.github.io/extensions/classes/HeyAuthn.html).

```typescript
import { HeyAuthn } from "@semaphore-extensions/heyauthn"

// STEP 1: Configure WebAuthn options.

const options = {
    rpName: "my-app",
    rpID: window.location.hostname,
    userID: "my-id",
    userName: "my-name"
}

// STEP 2: Register a new WebAuthn credential and get its Semaphore identity.

const { identity } = await HeyAuthn.fromRegister(options)

// Now you could also save the identity commitment in your DB (pseudocode).
fetch("/api/register" /* Replace this with your endpoint */, {
    identity.commitment
    // ...
})

// STEP 3: Authenticate existing WebAuthn credential and signal.

const { identity } = await HeyAuthn.fromRegister(options)

// Get existing group and signal anonymously (pseudocode).
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { utils } from "ethers"

const group = new Group()

group.addMembers(memberList)

const message = utils.formatBytes32String("Hey anon!")

generateProof(identity, group, message, group.root)
```

## Authors

-   [Vivek Bhupatiraju](https://github.com/vb7401)
-   [Richard Liu](https://github.com/rrrliu)
-   [emma](https://github.com/emmaguo13)
-   [Sehyun Chung](https://github.com/sehyunc)
-   [Enrico Bottazzi](https://github.com/enricobottazzi)
