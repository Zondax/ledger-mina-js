# @zondax/ledger-Mina

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/%40zondax%2Fledger-Mina.svg)](https://badge.fury.io/js/%40zondax%2Fledger-Mina)

This package provides a basic client library to communicate with the Mina App running in a Ledger Device

We recommend using the npmjs package in order to receive updates/fixes.

### App Operations

| Operation     | Response                          | Command | Notes                        |
| ------------- | --------------------------------- | ------- | ---------------------------- |
| getAppName    | { name: string, version: string } | None    | Returns app name and version |
| getAppVersion | { version: string }               | None    | Returns app version          |

### Address Operations

| Operation  | Response              | Command                    | Notes                                  |
| ---------- | --------------------- | -------------------------- | -------------------------------------- |
| getAddress | { publicKey: string } | account + showAddrInDevice | Retrieves public key for given account |

### Transaction Operations

| Operation       | Response                                                                         | Command                                                                                                         | Notes                                       |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| signTransaction | { signature: string }                                                            | txType + senderAccount + senderAddress + receiverAddress + amount + fee + nonce + validUntil + memo + networkId | Signs a Mina transaction                    |
| signMessage     | { field: string, scalar: string, raw_signature: string, signed_message: string } | account + networkId + message                                                                                   | Signs a message using the specified account |

### Transaction Types

| Type       | Value | Description            |
| ---------- | ----- | ---------------------- |
| PAYMENT    | 0x00  | Payment transaction    |
| DELEGATION | 0x04  | Delegation transaction |

### Network IDs

| Network | Value | Description  |
| ------- | ----- | ------------ |
| MAINNET | 0x01  | Mina mainnet |
| DEVNET  | 0x00  | Mina devnet  |

## Notes

Use `yarn install` to avoid issues.
