export const GET_ADDRESS_RESPONSE_APDU =
  "423632716e7a62586d524e6f397133326e34534e75326d70423865374659594c48384e6d6158366f464342596a6a513853624437757a56009000";
export const EXPECTED_PK =
  "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV";

export const SIGN_TRANSACTION_RESPONSE_APDU =
  "11a36a8dfe5b857b95a2a7b7b17c62c3ea33411ae6f4eb3a907064aecae353c60794f1d0288322fe3f8bb69d6fabd4fd7c15f8d09f8783b2f087a80407e299af9000";
export const TX_DATA = {
  txParams: {
    txType: 0,
    senderAccount: 0,
    senderAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
    receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
    amount: 1729000000000,
    fee: 2000000000,
    nonce: 16,
    validUntil: 271828,
    memo: "Hello Mina!",
    networkId: 0,
  },
  signature:
    "11a36a8dfe5b857b95a2a7b7b17c62c3ea33411ae6f4eb3a907064aecae353c60794f1d0288322fe3f8bb69d6fabd4fd7c15f8d09f8783b2f087a80407e299af",
};

export const MSG_DATA = {
  publicKey: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
  privateKey: "EKDt66ubGg5SDiwcQABWfFZaruq6idcyrLLfyZQjoH4CN3PHEiNj",
  name: "test_sign_msg_2",
  msg: {
    msg: "This is a test for Mina's Ledger app Sign Message on Mainnet",
    account: 0,
    networkId: 1,
  },
};
export const SIGN_MESSAGE_RESPONSE_APDU =
  "2f89a317dbafe3aeb75496516b439cde6dadfa7124f0265638edda63fa49e27429001aac36ece1addd26a206642eb15f790c25e21add4f92ba8df79fa42439209000";
export const EXPECTED_SIGN_MESSAGE_RESPONSE = {
  signature: {
    field: "21501887559157207684505038614252546924854285613710576755883778776557320528500",
    scalar: "18545010880214076399280010817207365737023752795743201376925149029727285295392",
  },
  publicKey: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
  data: "Message : This is a test for Mina's Ledger app Sign Message on Mainnet",
};

export const GET_VERSION_RESPONSE_APDU = "0104039000"
export const EXPECTED_GET_VERSION_RESPONSE = { version: '1.4.3', returnCode: '9000' }
