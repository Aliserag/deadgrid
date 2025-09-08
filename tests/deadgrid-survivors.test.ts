import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("DeadGrid Survivors NFT Contract", () => {
  describe("Minting", () => {
    it("should allow minting a new survivor", () => {
      const name = "John Survivor";
      const faction = "Survivors";
      const mintPrice = 100000000; // 100 STX in microSTX

      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii(name), Cl.stringAscii(faction)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(1));
      
      // Check token ownership
      const ownerResult = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-owner",
        [Cl.uint(1)],
        wallet1
      );
      
      expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });

    it("should increment token ID for each mint", () => {
      const result1 = simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii("Survivor 1"), Cl.stringAscii("Raiders")],
        wallet1
      );
      
      const result2 = simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii("Survivor 2"), Cl.stringAscii("Military")],
        wallet2
      );

      expect(result1.result).toBeOk(Cl.uint(1));
      expect(result2.result).toBeOk(Cl.uint(2));
    });

    it("should store survivor attributes correctly", () => {
      const name = "Elite Fighter";
      const faction = "Military";
      
      simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii(name), Cl.stringAscii(faction)],
        wallet1
      );

      const attributes = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-survivor-attributes",
        [Cl.uint(1)],
        wallet1
      );

      expect(attributes.result).toBeSome();
      const attrs = attributes.result.value;
      expect(attrs.name).toEqual(Cl.stringAscii(name));
      expect(attrs.faction).toEqual(Cl.stringAscii(faction));
      expect(attrs["days-survived"]).toEqual(Cl.uint(0));
    });
  });

  describe("Transfers", () => {
    beforeEach(() => {
      // Mint a survivor for testing
      simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii("Test Survivor"), Cl.stringAscii("Survivors")],
        wallet1
      );
    });

    it("should allow owner to transfer survivor", () => {
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify new ownership
      const ownerResult = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-owner",
        [Cl.uint(1)],
        wallet1
      );
      
      expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(wallet2)));
    });

    it("should fail transfer if not owner", () => {
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet2 // wallet2 doesn't own the NFT
      );

      expect(result.result).toBeErr();
    });
  });

  describe("Marketplace", () => {
    beforeEach(() => {
      // Mint survivors for testing
      simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii("Seller's Survivor"), Cl.stringAscii("Traders")],
        wallet1
      );
    });

    it("should allow listing a survivor for sale", () => {
      const listPrice = 200000000; // 200 STX
      
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "list-survivor",
        [Cl.uint(1), Cl.uint(listPrice)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify listing exists
      const listing = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-listing",
        [Cl.uint(1)],
        wallet1
      );

      expect(listing.result).toBeSome();
      expect(listing.result.value.price).toEqual(Cl.uint(listPrice));
      expect(listing.result.value.seller).toEqual(Cl.principal(wallet1));
    });

    it("should allow buying a listed survivor", () => {
      const listPrice = 200000000;
      
      // List the survivor
      simnet.callPublicFn(
        "deadgrid-survivors",
        "list-survivor",
        [Cl.uint(1), Cl.uint(listPrice)],
        wallet1
      );

      // Buy the survivor
      const buyResult = simnet.callPublicFn(
        "deadgrid-survivors",
        "buy-survivor",
        [Cl.uint(1)],
        wallet2
      );

      expect(buyResult.result).toBeOk(Cl.bool(true));

      // Verify new ownership
      const ownerResult = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-owner",
        [Cl.uint(1)],
        wallet2
      );
      
      expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(wallet2)));

      // Verify listing removed
      const listing = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-listing",
        [Cl.uint(1)],
        wallet2
      );

      expect(listing.result).toBeNone();
    });

    it("should handle royalties correctly", () => {
      const listPrice = 200000000;
      const royaltyPercent = 5;
      const expectedRoyalty = (listPrice * royaltyPercent) / 100;
      
      // Get initial balances
      const deployerBalanceBefore = simnet.getAssetsMap().get("STX")?.get(deployer);
      const seller1BalanceBefore = simnet.getAssetsMap().get("STX")?.get(wallet1);
      
      // List and buy
      simnet.callPublicFn(
        "deadgrid-survivors",
        "list-survivor",
        [Cl.uint(1), Cl.uint(listPrice)],
        wallet1
      );

      simnet.callPublicFn(
        "deadgrid-survivors",
        "buy-survivor",
        [Cl.uint(1)],
        wallet2
      );

      // Check balances after
      const deployerBalanceAfter = simnet.getAssetsMap().get("STX")?.get(deployer);
      const seller1BalanceAfter = simnet.getAssetsMap().get("STX")?.get(wallet1);
      
      // Deployer should receive royalty
      expect(deployerBalanceAfter).toEqual(deployerBalanceBefore + expectedRoyalty);
      
      // Seller should receive price minus royalty
      expect(seller1BalanceAfter).toEqual(seller1BalanceBefore + (listPrice - expectedRoyalty));
    });

    it("should allow unlisting a survivor", () => {
      // List the survivor
      simnet.callPublicFn(
        "deadgrid-survivors",
        "list-survivor",
        [Cl.uint(1), Cl.uint(200000000)],
        wallet1
      );

      // Unlist it
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "unlist-survivor",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify listing removed
      const listing = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-listing",
        [Cl.uint(1)],
        wallet1
      );

      expect(listing.result).toBeNone();
    });
  });

  describe("Survivor Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii("Veteran"), Cl.stringAscii("Military")],
        wallet1
      );
    });

    it("should allow updating survivor stats", () => {
      const daysToAdd = 10;
      
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "update-survivor-stats",
        [Cl.uint(1), Cl.uint(daysToAdd)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify stats updated
      const attributes = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-survivor-attributes",
        [Cl.uint(1)],
        wallet1
      );

      expect(attributes.result.value["days-survived"]).toEqual(Cl.uint(daysToAdd));
    });

    it("should not allow non-owner to update stats", () => {
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "update-survivor-stats",
        [Cl.uint(1), Cl.uint(5)],
        wallet2 // Not the owner
      );

      expect(result.result).toBeErr(Cl.uint(101)); // err-not-token-owner
    });

    it("should allow burning (permadeath) of survivor", () => {
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "burn-survivor",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify NFT no longer exists
      const ownerResult = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-owner",
        [Cl.uint(1)],
        wallet1
      );
      
      expect(ownerResult.result).toBeOk(Cl.none());

      // Verify attributes removed
      const attributes = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-survivor-attributes",
        [Cl.uint(1)],
        wallet1
      );

      expect(attributes.result).toBeNone();
    });
  });

  describe("Admin Functions", () => {
    it("should allow owner to update mint price", () => {
      const newPrice = 150000000; // 150 STX
      
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "set-mint-price",
        [Cl.uint(newPrice)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify price updated
      const price = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-mint-price",
        [],
        wallet1
      );

      expect(price.result).toBeOk(Cl.uint(newPrice));
    });

    it("should not allow non-owner to update mint price", () => {
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "set-mint-price",
        [Cl.uint(150000000)],
        wallet1 // Not the contract owner
      );

      expect(result.result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("should allow owner to update royalty percent", () => {
      const newPercent = 10;
      
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "set-royalty-percent",
        [Cl.uint(newPercent)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should not allow royalty above 100%", () => {
      const result = simnet.callPublicFn(
        "deadgrid-survivors",
        "set-royalty-percent",
        [Cl.uint(101)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(107));
    });
  });

  describe("Read Functions", () => {
    it("should return correct token URI", () => {
      simnet.callPublicFn(
        "deadgrid-survivors",
        "mint-survivor",
        [Cl.stringAscii("URI Test"), Cl.stringAscii("Survivors")],
        wallet1
      );

      const uri = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-token-uri",
        [Cl.uint(1)],
        wallet1
      );

      expect(uri.result).toBeOk(Cl.some(Cl.stringAscii("https://deadgrid.io/api/survivor/1")));
    });

    it("should track last token ID correctly", () => {
      // Mint 3 survivors
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn(
          "deadgrid-survivors",
          "mint-survivor",
          [Cl.stringAscii(`Survivor ${i}`), Cl.stringAscii("Survivors")],
          wallet1
        );
      }

      const lastId = simnet.callReadOnlyFn(
        "deadgrid-survivors",
        "get-last-token-id",
        [],
        wallet1
      );

      expect(lastId.result).toBeOk(Cl.uint(3));
    });
  });
});