import { BigNumber } from "ethers";
import { LogDescription } from "forta-agent";
import {
  Finding,
  getEthersProvider,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import PriceFetcher from "./price.fetcher";
import {
  EVENTS_SIGNATURES,
  STAKING_CONTRACT,
  CHAINLINK_AMP_DATA_FEED,
} from "./utils";
import { createFinding } from "./utils";

const THRESHOLD: BigNumber = BigNumber.from(10 ** 6); // 1M USD
const amount_correction: BigNumber = BigNumber.from(10).pow(18);
const price_correction: BigNumber = BigNumber.from(10).pow(8);

export const provideHandleTransaction =
  (
    staking_contract: string,
    fetcher: PriceFetcher,
    threshold: BigNumber
  ): HandleTransaction =>
  async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];
    // get the event logs
    const logs: LogDescription[] = txEvent.filterLog(
      EVENTS_SIGNATURES,
      staking_contract
    );
    if (!logs) return findings;

    // get the token price in USD.
    const price_feed: BigNumber[] = await fetcher.getAmpPrice(
      txEvent.blockNumber,
      CHAINLINK_AMP_DATA_FEED
    );
    let token_price = price_feed[1]; // the price is given in USD * 10^8

    logs.forEach((log) => {
      let amount: BigNumber = log.args.amount; //get the amount transfered, given in USD * 10^18
      //if the amount transfered is greater than the 1M threshold.
      if (
        amount
          .mul(token_price)
          .gte(threshold.mul(amount_correction).mul(price_correction))
      )
        findings.push(createFinding(log));
    });

    return findings;
  };

export default {
  handleTransaction: provideHandleTransaction(
    STAKING_CONTRACT,
    new PriceFetcher(getEthersProvider()),
    THRESHOLD
  ),
};
