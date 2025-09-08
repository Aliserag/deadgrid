import { 
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
  openSTXTransfer
} from '@stacks/connect';
import { 
  StacksMainnet,
  StacksTestnet,
  StacksMocknet
} from '@stacks/network';
import {
  AnchorMode,
  PostConditionMode,
  bufferCV,
  intCV,
  uintCV,
  standardPrincipalCV,
  stringAsciiCV,
  makeContractCall,
  callReadOnlyFunction,
  cvToJSON,
  broadcastTransaction,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
  tupleCV
} from '@stacks/transactions';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';

// Contract addresses - update these when deployed
const CONTRACTS = {
  mainnet: {
    survivorsNFT: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.deadgrid-survivors',
    gameState: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.deadgrid-game',
    economy: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.deadgrid-economy'
  },
  testnet: {
    survivorsNFT: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.deadgrid-survivors',
    gameState: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.deadgrid-game',
    economy: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.deadgrid-economy'
  },
  mocknet: {
    survivorsNFT: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.deadgrid-survivors',
    gameState: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.deadgrid-game',
    economy: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.deadgrid-economy'
  }
};

export type NetworkType = 'mainnet' | 'testnet' | 'mocknet';

export interface SurvivorAttributes {
  name: string;
  health: number;
  stamina: number;
  combatSkill: number;
  survivalSkill: number;
  daysSurvived: number;
  faction: string;
  createdAt: number;
}

export interface MarketplaceListing {
  price: number;
  seller: string;
}

class StacksService {
  private static instance: StacksService;
  private userSession: UserSession;
  private network: StacksMainnet | StacksTestnet | StacksMocknet;
  private networkType: NetworkType;
  private contracts: typeof CONTRACTS.mainnet;

  private constructor() {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    this.userSession = new UserSession({ appConfig });
    this.networkType = (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as NetworkType;
    this.setNetwork(this.networkType);
  }

  public static getInstance(): StacksService {
    if (!StacksService.instance) {
      StacksService.instance = new StacksService();
    }
    return StacksService.instance;
  }

  private setNetwork(type: NetworkType) {
    this.networkType = type;
    switch (type) {
      case 'mainnet':
        this.network = new StacksMainnet();
        this.contracts = CONTRACTS.mainnet;
        break;
      case 'mocknet':
        this.network = new StacksMocknet();
        this.contracts = CONTRACTS.mocknet;
        break;
      default:
        this.network = new StacksTestnet();
        this.contracts = CONTRACTS.testnet;
    }
  }

  // Authentication
  public async connectWallet(): Promise<void> {
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: {
          name: 'DeadGrid',
          icon: '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          resolve();
        },
        onCancel: () => {
          reject(new Error('User cancelled wallet connection'));
        },
        userSession: this.userSession,
      });
    });
  }

  public disconnectWallet(): void {
    this.userSession.signUserOut();
  }

  public isUserSignedIn(): boolean {
    return this.userSession.isUserSignedIn();
  }

  public getUserAddress(): string | null {
    if (!this.isUserSignedIn()) return null;
    const userData = this.userSession.loadUserData();
    return userData.profile.stxAddress[this.networkType];
  }

  // Survivor NFT Functions
  public async mintSurvivor(name: string, faction: string): Promise<void> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const functionArgs = [
      stringAsciiCV(name),
      stringAsciiCV(faction)
    ];

    const mintPrice = await this.getMintPrice();

    const postConditions = [
      makeStandardSTXPostCondition(
        this.getUserAddress()!,
        FungibleConditionCode.Equal,
        mintPrice
      )
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'mint-survivor',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      network: this.network,
      appDetails: {
        name: 'DeadGrid',
        icon: '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Survivor minted!', data);
      },
    };

    await openContractCall(options);
  }

  public async transferSurvivor(tokenId: number, recipient: string): Promise<void> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    const sender = this.getUserAddress()!;
    
    const functionArgs = [
      uintCV(tokenId),
      standardPrincipalCV(sender),
      standardPrincipalCV(recipient)
    ];

    const postConditions = [
      makeStandardNonFungiblePostCondition(
        sender,
        NonFungibleConditionCode.Sends,
        createAssetInfo(contractAddress, contractName, 'deadgrid-survivor'),
        uintCV(tokenId)
      )
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'transfer',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      network: this.network,
      appDetails: {
        name: 'DeadGrid',
        icon: '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Survivor transferred!', data);
      },
    };

    await openContractCall(options);
  }

  public async listSurvivorForSale(tokenId: number, price: number): Promise<void> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const functionArgs = [
      uintCV(tokenId),
      uintCV(price * 1000000) // Convert STX to microSTX
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'list-survivor',
      functionArgs,
      postConditionMode: PostConditionMode.Allow,
      network: this.network,
      appDetails: {
        name: 'DeadGrid',
        icon: '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Survivor listed!', data);
      },
    };

    await openContractCall(options);
  }

  public async buySurvivor(tokenId: number): Promise<void> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const listing = await this.getMarketplaceListing(tokenId);
    if (!listing) throw new Error('Survivor not listed for sale');

    const functionArgs = [uintCV(tokenId)];

    const postConditions = [
      makeStandardSTXPostCondition(
        this.getUserAddress()!,
        FungibleConditionCode.Equal,
        listing.price
      )
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'buy-survivor',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      network: this.network,
      appDetails: {
        name: 'DeadGrid',
        icon: '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Survivor purchased!', data);
      },
    };

    await openContractCall(options);
  }

  public async burnSurvivor(tokenId: number): Promise<void> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const functionArgs = [uintCV(tokenId)];

    const postConditions = [
      makeStandardNonFungiblePostCondition(
        this.getUserAddress()!,
        NonFungibleConditionCode.Sends,
        createAssetInfo(contractAddress, contractName, 'deadgrid-survivor'),
        uintCV(tokenId)
      )
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'burn-survivor',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      network: this.network,
      appDetails: {
        name: 'DeadGrid',
        icon: '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Survivor burned (permadeath)!', data);
      },
    };

    await openContractCall(options);
  }

  // Read-only functions
  public async getSurvivorAttributes(tokenId: number): Promise<SurvivorAttributes | null> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'get-survivor-attributes',
      functionArgs: [uintCV(tokenId)],
      network: this.network,
      senderAddress: this.getUserAddress() || contractAddress,
    };

    try {
      const result = await callReadOnlyFunction(options);
      const json = cvToJSON(result);
      
      if (json.success && json.value) {
        return {
          name: json.value.name.value,
          health: parseInt(json.value.health.value),
          stamina: parseInt(json.value.stamina.value),
          combatSkill: parseInt(json.value['combat-skill'].value),
          survivalSkill: parseInt(json.value['survival-skill'].value),
          daysSurvived: parseInt(json.value['days-survived'].value),
          faction: json.value.faction.value,
          createdAt: parseInt(json.value['created-at'].value),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting survivor attributes:', error);
      return null;
    }
  }

  public async getSurvivorOwner(tokenId: number): Promise<string | null> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'get-owner',
      functionArgs: [uintCV(tokenId)],
      network: this.network,
      senderAddress: this.getUserAddress() || contractAddress,
    };

    try {
      const result = await callReadOnlyFunction(options);
      const json = cvToJSON(result);
      
      if (json.success && json.value && json.value.value) {
        return json.value.value.value;
      }
      return null;
    } catch (error) {
      console.error('Error getting survivor owner:', error);
      return null;
    }
  }

  public async getMarketplaceListing(tokenId: number): Promise<MarketplaceListing | null> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'get-listing',
      functionArgs: [uintCV(tokenId)],
      network: this.network,
      senderAddress: this.getUserAddress() || contractAddress,
    };

    try {
      const result = await callReadOnlyFunction(options);
      const json = cvToJSON(result);
      
      if (json.value) {
        return {
          price: parseInt(json.value.price.value),
          seller: json.value.seller.value,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting marketplace listing:', error);
      return null;
    }
  }

  public async getMintPrice(): Promise<number> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'get-mint-price',
      functionArgs: [],
      network: this.network,
      senderAddress: this.getUserAddress() || contractAddress,
    };

    try {
      const result = await callReadOnlyFunction(options);
      const json = cvToJSON(result);
      
      if (json.success && json.value) {
        return parseInt(json.value.value);
      }
      return 100000000; // Default 100 STX
    } catch (error) {
      console.error('Error getting mint price:', error);
      return 100000000;
    }
  }

  public async getLastTokenId(): Promise<number> {
    const [contractAddress, contractName] = this.contracts.survivorsNFT.split('.');
    
    const options = {
      contractAddress,
      contractName,
      functionName: 'get-last-token-id',
      functionArgs: [],
      network: this.network,
      senderAddress: this.getUserAddress() || contractAddress,
    };

    try {
      const result = await callReadOnlyFunction(options);
      const json = cvToJSON(result);
      
      if (json.success && json.value) {
        return parseInt(json.value.value);
      }
      return 0;
    } catch (error) {
      console.error('Error getting last token ID:', error);
      return 0;
    }
  }

  // Helper function to get all survivors owned by current user
  public async getUserSurvivors(): Promise<number[]> {
    const userAddress = this.getUserAddress();
    if (!userAddress) return [];

    const lastTokenId = await this.getLastTokenId();
    const ownedTokens: number[] = [];

    // Check ownership for each token
    for (let tokenId = 1; tokenId <= lastTokenId; tokenId++) {
      const owner = await this.getSurvivorOwner(tokenId);
      if (owner === userAddress) {
        ownedTokens.push(tokenId);
      }
    }

    return ownedTokens;
  }

  // Get all marketplace listings
  public async getAllMarketplaceListings(): Promise<Array<{tokenId: number, listing: MarketplaceListing}>> {
    const lastTokenId = await this.getLastTokenId();
    const listings: Array<{tokenId: number, listing: MarketplaceListing}> = [];

    for (let tokenId = 1; tokenId <= lastTokenId; tokenId++) {
      const listing = await this.getMarketplaceListing(tokenId);
      if (listing) {
        listings.push({ tokenId, listing });
      }
    }

    return listings;
  }
}

export default StacksService;