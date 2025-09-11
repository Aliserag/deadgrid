import { 
  AppConfig,
  UserSession,
  showConnect,
  openContractCall
} from '@stacks/connect';

import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  principalCV,
  FungibleConditionCode,
  NonFungibleConditionCode,
  Pc
} from '@stacks/transactions';

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

class StacksServiceSimple {
  private static instance: StacksServiceSimple;
  private userSession: UserSession;
  private networkType: NetworkType;
  private networkUrl: string;

  private constructor() {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    this.userSession = new UserSession({ appConfig });
    this.networkType = (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as NetworkType;
    this.networkUrl = this.getNetworkUrl();
  }

  public static getInstance(): StacksServiceSimple {
    if (!StacksServiceSimple.instance) {
      StacksServiceSimple.instance = new StacksServiceSimple();
    }
    return StacksServiceSimple.instance;
  }

  private getNetworkUrl(): string {
    switch (this.networkType) {
      case 'mainnet':
        return 'https://stacks-node-api.mainnet.stacks.co';
      case 'mocknet':
        return 'http://localhost:3999';
      default:
        return 'https://stacks-node-api.testnet.stacks.co';
    }
  }

  private getContractAddress(): string {
    // Update these when you deploy your contracts
    switch (this.networkType) {
      case 'mainnet':
        return 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.deadgrid-survivors';
      case 'testnet':
        return 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.deadgrid-survivors';
      default:
        return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.deadgrid-survivors';
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

  // Mint a new survivor NFT
  public async mintSurvivor(name: string, faction: string): Promise<void> {
    const [contractAddress, contractName] = this.getContractAddress().split('.');
    
    const functionArgs = [
      stringAsciiCV(name),
      stringAsciiCV(faction)
    ];

    const mintPrice = 100000000; // 100 STX in microSTX

    const postConditions = [
      Pc.principal(this.getUserAddress()!)
        .willSendEq(mintPrice)
        .ustx()
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'mint-survivor',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
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

  // Transfer survivor to another player
  public async transferSurvivor(tokenId: number, recipient: string): Promise<void> {
    const [contractAddress, contractName] = this.getContractAddress().split('.');
    const sender = this.getUserAddress()!;
    
    const functionArgs = [
      uintCV(tokenId),
      principalCV(sender),
      principalCV(recipient)
    ];

    // NFT post conditions would go here
    const postConditions: any[] = [];

    const options = {
      contractAddress,
      contractName,
      functionName: 'transfer',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
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

  // List survivor for sale
  public async listSurvivorForSale(tokenId: number, price: number): Promise<void> {
    const [contractAddress, contractName] = this.getContractAddress().split('.');
    
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
      anchorMode: AnchorMode.Any,
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

  // Buy a listed survivor
  public async buySurvivor(tokenId: number, price: number): Promise<void> {
    const [contractAddress, contractName] = this.getContractAddress().split('.');
    
    const functionArgs = [uintCV(tokenId)];

    const postConditions = [
      Pc.principal(this.getUserAddress()!)
        .willSendEq(price * 1000000)
        .ustx()
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: 'buy-survivor',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
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

  // Burn a survivor (permadeath)
  public async burnSurvivor(tokenId: number): Promise<void> {
    const [contractAddress, contractName] = this.getContractAddress().split('.');
    
    const functionArgs = [uintCV(tokenId)];

    // NFT post conditions would go here
    const postConditions: any[] = [];

    const options = {
      contractAddress,
      contractName,
      functionName: 'burn-survivor',
      functionArgs,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      anchorMode: AnchorMode.Any,
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

  // Simple helper - in production you'd fetch from API or use read-only functions
  public async getUserSurvivors(): Promise<number[]> {
    // This would normally query the blockchain
    // For now, return empty array
    return [];
  }
}

export default StacksServiceSimple;