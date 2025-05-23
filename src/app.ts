/** ******************************************************************************
 *  (c) 2019-2024 Zondax AG
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
import type Transport from "@ledgerhq/hw-transport";
import BaseApp, {
  BIP32Path,
  INSGeneric,
  processErrorResponse,
  processResponse,
} from "@zondax/ledger-js";

import { P1_VALUES, PUBKEYLEN } from "./consts";
import { ResponseSign, ResponseAddress } from "./types";

interface SignTransactionArgs {
  txType: number;
  senderAccount: number;
  senderAddress: string;
  receiverAddress: string;
  amount: number;
  fee: number;
  nonce: number;
  validUntil?: number;
  memo?: string;
  networkId: number;
}
interface BaseLedgerResponse {
  returnCode: string;
  statusText?: string;
  message?: string;
}

interface GetAppVersionResponse extends BaseLedgerResponse {
  version?: string | null;
}

interface GetAddressResponse extends BaseLedgerResponse {
  publicKey?: string | null;
}

interface GetAppNameResponse extends BaseLedgerResponse {
  name?: string;
  version?: string | null;
}

interface SignTransactionResponse extends BaseLedgerResponse {
  signature?: string | null;
}

interface SignMessageResponse extends BaseLedgerResponse {
  field: string | null;
  scalar: string | null;
  raw_signature?: string | null;
  signed_message?: string | null;
}

export class MinaApp extends BaseApp {
  static _INS = {
    GET_VERSION: 0x01 as number,
    GET_ADDR: 0x02 as number,
    SIGN_TX: 0x03 as number,
    TEST_CRYPTO: 0x04 as number,
    SIGN_MSG: 0x05 as number,
  };

  static _params = {
    cla: 0xe0,
    ins: { ...MinaApp._INS } as INSGeneric,
    p1Values: { ONLY_RETRIEVE: 0x00 as 0, SHOW_ADDRESS_IN_DEVICE: 0x01 as 1 },
    chunkSize: 250,
    requiredPathLengths: [5],
  };

  constructor(transport: Transport) {
    super(transport, MinaApp._params);
    if (!this.transport) {
      throw new Error("Transport has not been defined");
    }
  }

  async getAppName(): Promise<GetAppNameResponse> {
    try {
      const version = await this.getAppVersion();

      return {
        name: "Mina",
        version: version.version,
        returnCode: "9000",
      };
    } catch (error) {
      const respError = processErrorResponse(error);
      return {
        name: undefined,
        version: undefined,
        returnCode: respError.returnCode.toString(),
        message: respError.errorMessage,
      };
    }
  }

  async getAppVersion(): Promise<GetAppVersionResponse> {
    try {
      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.GET_VERSION,
        0,
        0,
      );
      const response = processResponse(responseBuffer);

      if (response.length() !== 3) {
        throw new Error("Response length is not valid");
      }

      const version =
        "" +
        response.readBytes(1).readUInt8() +
        "." +
        response.readBytes(1).readUInt8() +
        "." +
        response.readBytes(1).readUInt8();

      return {
        version,
        returnCode: "9000",
      };
    } catch (error) {
      const respError = processErrorResponse(error);
      return {
        version: null,
        returnCode: respError.returnCode.toString(),
        message: respError.errorMessage,
      };
    }
  }

  async getAddress(
    account?: number,
    showAddrInDevice = true,
  ): Promise<GetAddressResponse> {
    if (!Number.isInteger(account)) {
      return {
        publicKey: null,
        returnCode: "-5",
        message: "Account number must be an Integer",
      };
    }
    if (account === undefined) {
      return {
        publicKey: null,
        returnCode: "-1",
        message: "Account number is required",
      };
    }

    const accountBuf = Buffer.from(
      account.toString(16).padStart(8, "0"),
      "hex",
    );

    const p1 = showAddrInDevice
      ? P1_VALUES.SHOW_ADDRESS_IN_DEVICE
      : P1_VALUES.ONLY_RETRIEVE;

    try {
      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.GET_ADDR,
        p1,
        0,
        accountBuf,
      );
      const response = processResponse(responseBuffer);

      return {
        publicKey: response.readBytes(PUBKEYLEN).toString(),
        returnCode: "9000",
      };
    } catch (error) {
      const respError = processErrorResponse(error);
      return {
        publicKey: null,
        returnCode: respError.returnCode.toString(),
        message: respError.errorMessage,
      };
    }
  }

  async signTransaction({
    txType,
    senderAccount,
    senderAddress,
    receiverAddress,
    amount,
    fee,
    nonce,
    validUntil,
    memo,
    networkId,
  }: SignTransactionArgs): Promise<SignTransactionResponse> {
    if (
      isNaN(txType) ||
      isNaN(senderAccount) ||
      !senderAddress ||
      !receiverAddress ||
      (!amount && txType === 0) /* PAYMENT */ ||
      !fee ||
      !Number.isInteger(amount) ||
      !Number.isInteger(fee) ||
      isNaN(nonce) ||
      isNaN(networkId)
    ) {
      return {
        signature: null,
        returnCode: "-1",
        message: "Missing or wrong arguments",
      };
    }

    if (memo && memo.length > 32) {
      return {
        signature: null,
        returnCode: "-3",
        message: "Memo field too long",
      };
    }
    if (fee < 1e6) {
      return {
        signature: null,
        returnCode: "-4",
        message: "Fee too small",

      };
    }

    const apdu = this.createTXApdu(
      txType,
      senderAccount,
      senderAddress,
      receiverAddress,
      amount,
      fee,
      nonce,
      validUntil,
      memo,
      networkId,
    );

    const apduBuffer = Buffer.from(apdu, "hex");
    const statusList = [0x9000, 0x6986];

    if (apduBuffer.length > 256) {
      return {
        signature: null,
        returnCode: "-2",
        message: "data length > 256 bytes",
        statusText: "DATA_TOO_BIG",
      };
    }

    try {
      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.SIGN_TX,
        0,
        0,
        apduBuffer,
        statusList,
      );

      const response = processResponse(responseBuffer);
      const signature = response.readBytes(response.length()).toString("hex");

      return {
        signature,
        returnCode: "9000",
      };
    } catch (e) {
      const respError = processErrorResponse(e);
      return {
        signature: null,
        returnCode: respError.returnCode.toString(),
        message: respError.errorMessage,
      };
    }
  }

  async signMessage(
    account: number,
    networkId: number,
    message: string,
  ): Promise<SignMessageResponse> {
    if (message.length === 0) {
      return {
        field: null,
        scalar: null,
        raw_signature: null,
        signed_message: null,
        returnCode: "-6",
        message: "Message is empty",
      };
    }
    if (message.length > 255) {
      return {
        field: null,
        scalar: null,
        raw_signature: null,
        signed_message: null,
        returnCode: "-7",
        message: "Message too long",
      };
    }
    try {
      const accountHex = Buffer.from(
        account.toString(16).padStart(8, "0"),
        "hex",
      );
      const networkIdHex = Buffer.from(
        networkId.toString(16).padStart(2, "0"),
        "hex",
      );
      const messageHex = Buffer.from(message, "utf8");
      // Calculate total buffer length
      const totalLength =
        accountHex.length + networkIdHex.length + messageHex.length;
      // Create buffer with total length
      const dataTx = Buffer.concat(
        [accountHex, networkIdHex, messageHex],
        totalLength,
      );

      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.SIGN_MSG,
        0,
        0,
        dataTx,
      );

      const response = processResponse(responseBuffer);
      
      // Validate minimum buffer length (64 bytes for signature + 1 byte for message length)
      if (response.length() < 65) {
        throw new Error("Response buffer too short");
      }

      // First read the signature (64 bytes)
      const signature = response.readBytes(64).toString("hex");
      const sigLength = signature.length;
      const field_extracted = signature.substring(0, sigLength / 2);
      const scalar_extracted = signature.substring(sigLength / 2, sigLength);
      
      // Then read the message length (1 byte)
      const messageLength = response.readBytes(1).readUInt8();
      
      // Validate remaining buffer length against message length
      if (response.length() < messageLength) {
        throw new Error("Response buffer too short for message");
      }
      
      // Finally read the message
      const returnedMessage = response.readBytes(messageLength).toString('utf8');

      return {
        field: BigInt("0x" + field_extracted).toString(),
        scalar: BigInt("0x" + scalar_extracted).toString(),
        raw_signature: signature,
        signed_message: returnedMessage,
        returnCode: "9000",
      };
    } catch (e) {
      const respError = processErrorResponse(e);
      return {
        field: null,
        scalar: null,
        raw_signature: null,
        signed_message: null,
        returnCode: respError.returnCode.toString(),
        message: respError.errorMessage,
      };
    }
  }

  createTXApdu(
    txType: number,
    senderAccount: number,
    senderAddress: string,
    receiverAddress: string,
    amount: number,
    fee: number,
    nonce: number,
    validUntil = 4294967295,
    memo = "",
    networkId: number,
  ) {
    const senderBip44AccountHex = Buffer.from(
      senderAccount.toString(16).padStart(8, "0"),
      "hex",
    ).toString("hex");
    const senderAddressHex = Buffer.from(senderAddress, "ascii").toString(
      "hex",
    );
    const receiverHex = Buffer.from(receiverAddress, "ascii").toString("hex");
    const amountHex = Buffer.from(
      amount.toString(16).padStart(16, "0"),
      "hex",
    ).toString("hex");
    const feeHex = Buffer.from(
      fee.toString(16).padStart(16, "0"),
      "hex",
    ).toString("hex");
    const nonceHex = Buffer.from(
      Number(nonce).toString(16).toUpperCase().padStart(8, "0"),
      "hex",
    ).toString("hex");
    const validUntilHex = Buffer.from(
      validUntil.toString(16).padStart(8, "0"),
      "hex",
    ).toString("hex");
    const memoHex = Buffer.from(memo.padEnd(32, "\0"), "utf8").toString("hex");
    const tagHex = Buffer.from(
      txType.toString(16).padStart(2, "0"),
      "hex",
    ).toString("hex");
    const networkIdHex = Buffer.from(
      networkId.toString(16).padStart(2, "0"),
      "hex",
    ).toString("hex");
    const apduMessage =
      senderBip44AccountHex +
      senderAddressHex +
      receiverHex +
      amountHex +
      feeHex +
      nonceHex +
      validUntilHex +
      memoHex +
      tagHex +
      networkIdHex;
    return apduMessage;
  }
}
