/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/test_transfer_hook.json`.
 */
export type TestTransferHook = {
  "address": "DvfS2GavVdWsTb4uvXwKUb5A6QysznCJCPB6cx3duQGE",
  "metadata": {
    "name": "testTransferHook",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createBounty",
      "discriminator": [
        122,
        90,
        14,
        143,
        8,
        125,
        200,
        2
      ],
      "accounts": [
        {
          "name": "bountyAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "address",
          "type": "pubkey"
        },
        {
          "name": "memo",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bountyInfo",
      "discriminator": [
        233,
        22,
        24,
        5,
        143,
        156,
        33,
        164
      ]
    }
  ],
  "types": [
    {
      "name": "bountyInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "memo",
            "type": "string"
          }
        ]
      }
    }
  ]
};
