/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bounty.json`.
 */
export type Bounty = {
  "address": "vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P",
  "metadata": {
    "name": "bounty",
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
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bountyAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "bountyTokenAccount",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
    },
    {
      "name": "deleteBounty",
      "discriminator": [
        43,
        167,
        107,
        186,
        99,
        55,
        246,
        25
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bountyAccount",
          "writable": true
        },
        {
          "name": "owner",
          "relations": [
            "bountyAccount"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateBounty",
      "discriminator": [
        162,
        254,
        23,
        153,
        115,
        85,
        83,
        203
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bountyAccount",
          "writable": true
        },
        {
          "name": "owner",
          "relations": [
            "bountyAccount"
          ]
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
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint. Only the specified Token-2022 token is accepted"
    }
  ],
  "types": [
    {
      "name": "bountyInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "memo",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
