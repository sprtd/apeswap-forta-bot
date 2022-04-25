# Large BANANA Token Mint

## Description

This agent detects transactions with large Banana mints

## Supported Chains

- BNBChain


## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a transaction contains a BANANA token mint exceeding  10,000 
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x63b996196eaff9bc14983fd9c4fcf9b6d64762b499bd1a78346045291f4535e9 (25,000 BANANA )
