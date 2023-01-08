import { AccountsStore } from "./accounts"
import { ethers } from 'ethers'
import { contractAbi, contractBin } from "./contract"
import ganache, { ServerOptions, Server } from 'ganache'

const ganacheServerOptions = {
    database: {
        dbPath: `../ganache`
    },
    chain: {
        chainId: 1337
    },
    wallet: {
        totalAccounts: 20,
        deterministic: true,
        accountKeysPath: `./accounts_dev.json`
    },
    // logging: {
    //     quiet: true
    // }
} as ServerOptions<"ethereum">

async function run() {

    const server = ganache.server( ganacheServerOptions )
    server.listen( 7000  )

    const owner = new AccountsStore(`accounts.json`).getAddressByIndex(0)

    const provider = new ethers.providers.JsonRpcProvider( `http://localhost:7000` )
    const signer = provider.getSigner( owner )

    const contractFactory = new ethers.ContractFactory( contractAbi.toString(), contractBin.toString(), signer );

    const deployedContract = await contractFactory.deploy()
    const contractAddress = deployedContract.address


    const contract = new ethers.Contract( contractAddress,  contractAbi.toString(), provider )

    console.log( contract )

}

run()

// async function test() {
//     console.log(     await contract.functions.getOwner()    )
// }

// test()
