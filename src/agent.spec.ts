import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";

import agent, {
  
  TETHER_ADDRESS,
  TETHER_DECIMALS,
  BANANA_CONTRACT_ADDRESS_BNBCHAIN, 
  BANANA_MINT_FUNCTION, 
  BANANA_MINT_AMOUNT
} from "./agent";

import { formatEther } from '@ethersproject/units'

describe("high tether transfer agent", () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no BANANA mints", async () => {
      mockTxEvent.filterFunction = jest.fn().mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        BANANA_MINT_FUNCTION, 
        BANANA_CONTRACT_ADDRESS_BNBCHAIN
      );
    });

    it("returns a finding if there is a Tether transfer over 10,000", async () => {
      const mockBananaMint = {
        args: {
          from: "0xabc",
          to: "0xdef",
          // value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
          value: formatEther(BANANA_MINT_AMOUNT)
        },
      };
      mockTxEvent.filterLog = jest
        .fn()
        .mockReturnValue([mockBananaMint]);

      const findings = await handleTransaction(mockTxEvent);
      const normalizedValue = formatEther(mockBananaMint.args.value)

      // const normalizedValue = mockBananaMint.args.value.div(
      //   10 ** TETHER_DECIMALS
      // );
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Large Banana Mint",
          description: `Large amount of BANANA minted: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Critical,
          type: FindingType.Suspicious,
          metadata: {
            to: mockBananaMint.args.to,
            from: mockBananaMint.args.from,
            value: normalizedValue
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
        BANANA_MINT_FUNCTION, 
        BANANA_CONTRACT_ADDRESS_BNBCHAIN
      );
    });
  });
});
