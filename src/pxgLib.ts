import { createAlchemyWeb3, AlchemyWeb3 } from "@alch/alchemy-web3";

import PxgLib, { InitWeb3Fn } from "pxg-js";

export let web3: any;
const initWeb3: InitWeb3Fn<AlchemyWeb3> = (provider) => {
  web3 = createAlchemyWeb3(
    "https://eth-mainnet.alchemyapi.io/v2/Lwcf2LS-K1-GBk39izFMc7y2B7lt9nb9",
    // @ts-ignore
    { writeProvider: provider }
  );
  return web3;
};

export const pxgLib = new PxgLib({
  initWeb3,
  // @ts-ignore
  initAccounts: () => window?.ethereum.enable(),
  network: "live",
});
