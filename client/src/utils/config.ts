import { http, createConfig } from '@wagmi/core'
import { Chain } from '@wagmi/core/chains'

export const localAnvilChain: Chain = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
  testnet: true
}

export const config = createConfig({
  chains: [localAnvilChain],
  connectors: [],
  transports: {
    [localAnvilChain.id]: http(),
  },
})