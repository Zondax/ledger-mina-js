import { MinaApp } from "../../../src/app";
import { MockTransport } from "@ledgerhq/hw-transport-mocker";
import { describe, it, expect } from "@jest/globals";
import {
  EXPECTED_GET_VERSION_RESPONSE,
  EXPECTED_PK,
  EXPECTED_SIGN_MESSAGE_RESPONSE,
  GET_ADDRESS_RESPONSE_APDU,
  GET_VERSION_RESPONSE_APDU,
  MSG_DATA,
  SIGN_MESSAGE_RESPONSE_APDU,
  SIGN_TRANSACTION_RESPONSE_APDU,
  TX_DATA,
} from "../helper";

export const runLedgerTests = (environment: string) => {
  describe(`Ledger ${environment} Integration Tests`, () => {
    let transport: MockTransport;
    let app: MinaApp;

    beforeAll(async () => {
      try {
        let buffer = Buffer.from([0x01, 0x02, 0x03, 0x94]);
        transport = new MockTransport(buffer);
        app = new MinaApp(transport);
      } catch (error) {
        console.error("Failed to create mock transport:", error);
        throw error;
      }
    });

    afterAll(async () => {
      if (transport) {
        await transport.close();
      }
    });

    it("Retreive version", async () => {
      const responseBuffer = Buffer.from(GET_VERSION_RESPONSE_APDU, "hex");
      const transport = new MockTransport(responseBuffer);
      const app = new MinaApp(transport);
      const resp = await app.getAppVersion();
      expect(resp).toEqual(EXPECTED_GET_VERSION_RESPONSE);
    });

    it("Retreive valid public key and address", async () => {
      const responseBuffer = Buffer.from(GET_ADDRESS_RESPONSE_APDU, "hex");

      const transport = new MockTransport(responseBuffer);
      const app = new MinaApp(transport);
      const resp = await app.getAddress(0, false);

      expect(resp.publicKey).toEqual(EXPECTED_PK);
    });

    it("Sign transaction", async () => {
      const responseBuffer = Buffer.from(SIGN_TRANSACTION_RESPONSE_APDU, "hex");

      const transport = new MockTransport(responseBuffer);
      const app = new MinaApp(transport);
      const resp = await app.signTransaction(TX_DATA.txParams);

      expect(resp.signature).toEqual(TX_DATA.signature);
    });

    it("Sign message", async () => {
      const responseBuffer = Buffer.from(SIGN_MESSAGE_RESPONSE_APDU, "hex");

      const transport = new MockTransport(responseBuffer);
      const app = new MinaApp(transport);
      const resp = await app.signMessage(
        MSG_DATA.msg.account,
        MSG_DATA.msg.networkId,
        MSG_DATA.msg.msg,
      );

      expect(resp.field).toEqual(
        EXPECTED_SIGN_MESSAGE_RESPONSE.signature.field,
      );
      expect(resp.scalar).toEqual(
        EXPECTED_SIGN_MESSAGE_RESPONSE.signature.scalar,
      );
    });
  });
};
