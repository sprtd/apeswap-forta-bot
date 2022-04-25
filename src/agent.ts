import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import { GLOBALS } from './constants'

import { formatEther } from '@ethersproject/units'

const { 
  BANANA_CONTRACT_ADDRESS_BNBCHAIN, 
  BANANA_MINT_FUNCTION, 
  BANANA_MINT_AMOUNT
} = GLOBALS

export const ERC20_TRANSFER_EVENT =
  "event Transfer(address indexed from, address indexed to, uint256 value)";
export const TETHER_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const TETHER_DECIMALS = 6;
let findingsCount = 0;

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {

  const findings: Finding[] = [];

  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;


  // filter transaction logs for Banana token mints
  const bananaMints = txEvent.filterFunction(
    BANANA_MINT_FUNCTION, BANANA_CONTRACT_ADDRESS_BNBCHAIN)

  console.log(`mint ape token events array: ${bananaMints}`)
  const txEventObject: any = txEvent.transaction

  console.log({...txEventObject})

  const { from, to, value } = txEvent.transaction
  const txTo: any = to
  
  console.log(`from: ${from}`)
  console.log(`to: ${to}`)
  console.log(`type of to: ${typeof(to)}`)
  console.log(`value: ${value}`)


  bananaMints.forEach(bananaMint => {
    const { args } = bananaMint
    console.log(`mint ape: ${bananaMint}`)
    console.log(`banana mint args: ${args}`)
    console.log(`________`)
    console.log({...args})
    const [ txValue ] = args
    console.log(`type of tx value: ${typeof(txValue)}`)
    console.log(`tx value: ${txValue}`)

    console.log(`mint banana array: ${ bananaMints }`)
    console.log({...bananaMints })
    console.log(`type of value: ${typeof(args)}`)
    const formattedValue: any = formatEther(txValue)
    
    console.log(`formatted value: ${(formattedValue)}`)

    if(formattedValue > BANANA_MINT_AMOUNT) {
      findings.push(
        Finding.fromObject({
          name: "Large Banana Mint",
          description: `Large amount of BANANA minted: ${formattedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Critical,
          type: FindingType.Suspicious, 
          metadata: {
            value: formattedValue,
            from,
            to: txTo
          }
        })
      )
      findingsCount ++
    }
  })

  return findings;
};

export {
  handleTransaction,
  BANANA_CONTRACT_ADDRESS_BNBCHAIN, 
  BANANA_MINT_FUNCTION, 
  BANANA_MINT_AMOUNT
};

export default {
  handleTransaction
}