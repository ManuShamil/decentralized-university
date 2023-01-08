import ganache, { 
    provider,
    Server, 
    ServerOptions 
} from 'ganache'
import { 
    Contract,
    ContractFactory 
} from 'ethers'
import { readFileSync } from 'fs'

import { AccountsStore } from './accounts'
import { JsonRpcProvider } from '@ethersproject/providers'

const SERVER_PORT: number = 9000
const CLIENT_PORT: number = 7000

const accountsJson = `accounts_dev.json`


let ganacheServer: Server<'ethereum'>
let localProvider: JsonRpcProvider
let accountsStore: AccountsStore
let smartContractOwner: string

let contractAbi: string = readFileSync(`../contracts/university_sol_University.abi`).toString()
let contractBin: string = readFileSync(`../contracts/university_sol_University.bin`).toString()
let smartContractAddress: string;


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

const coursesToAdd = [
    {
        courseName: `MCA`,
        fees: 1000000000000
    },
    {
        courseName: `Msc. Data Science`,
        fees: 1000000000000
    }
]


describe(`Deploying a contract`, () => {

    beforeAll( async () => {
        
        if ( CLIENT_PORT != SERVER_PORT ) return

        ganacheServer = ganache.server( ganacheServerOptions ) as Server<'ethereum'>
        await ganacheServer.listen( SERVER_PORT )

    })

    afterAll( async () => {

        console.log(`SMART CONTRACT ADDRESS: ${smartContractAddress}`)

        if ( CLIENT_PORT != SERVER_PORT ) return

        await ganacheServer.close()
    })


    describe(`ganache server`, () => {
        it(`is up`, () => {
            
            if ( CLIENT_PORT == SERVER_PORT )
                expect( ganacheServer).toBeTruthy()
        })

        describe(`ethers client`, () => {

            it (`can connect to ganache server`, async () => {
                localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                
                let { chainId } = await localProvider.getNetwork()

                expect( chainId ).toBe( 1337 )
            })
        })
        
        describe(`accounts`, () => {

            accountsStore = new AccountsStore( accountsJson ).load()
    
            it(`has data in it`, () => {
                expect( accountsStore.getAddressByIndex(0) ).toBeTruthy()
            })
    
        })

        describe(`smart contract deployment`, () => {

            smartContractOwner = accountsStore.getAddressByIndex(0) as string

            beforeAll( () => {
                return new Promise<string>( (resolve, reject) => {
                    let signer = localProvider.getSigner( smartContractOwner )
                    let contractFactory = new ContractFactory( contractAbi, contractBin, signer )
    
                    contractFactory.deploy()
                    .then( contract => {
                        smartContractAddress = contract.address
                        resolve(smartContractAddress)
                    })
                    .catch( reject )
                }) 
            })

            describe(`owner ${ smartContractOwner }`, () => {

                let deployedContract:Contract;
                
                let signer;

                beforeAll( async () => {

                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )

                    signer = localProvider.getSigner( smartContractOwner )
                    deployedContract = new Contract( smartContractAddress, contractAbi, signer )

                })

                it(`is owner of the smart contract: `, async () => {
    
                    let expectedOwner:string = (await deployedContract.functions.getOwner())[0]
                    expectedOwner = expectedOwner.toLowerCase()
    
                    expect( expectedOwner ).toBe( smartContractOwner )
                })

                it(`can add courses to the contract`, async () => {

                    let coursesAdded = await ((): Promise<number> => {
                        return new Promise<number>( async ( resolve, reject) => {

                            let coursedAdded = 0;
                            for ( let i=0; i<coursesToAdd.length; i++ ) {
                                let result = await deployedContract.functions.addCourse( coursesToAdd[i].courseName, coursesToAdd[i].fees )
        
                                console.log( result )

                                coursedAdded++
                            }

                            resolve( coursedAdded )
    
                        }) 
                    })()

                    expect( coursesAdded ).toBe( coursesToAdd.length )


                })

                it(`returns all courses in the list`, async () => {
                    let [ courseIdTotal ] = await deployedContract.functions.getCourseCount()
                    let courseIdCounter = Number.parseInt( courseIdTotal._hex, 16 )

                    const coursesReceived: any[] = []

                    for ( let i=0; i<courseIdCounter; i++ ) {
                        let [ courseName, fees ] = await deployedContract.getCourseById( i );

                        coursesReceived.push( { courseName, fees: Number.parseInt( fees._hex, 16 )} )
                    }

                    console.log( coursesReceived )

                    expect( coursesReceived.sort() ).toEqual( coursesToAdd )

                })
                
                it(`contract matches the new amount of courses added`, async () => {

                    let [ result ] = await deployedContract.functions.getCourseCount()

                    let courseCount = Number.parseInt( result._hex, 16)

                    expect( courseCount ).toBe( coursesToAdd.length )
                })
    
            })

            describe(`random wallet -> ${ accountsStore.getAddressByIndex( 5 ) }`, () => {

                let deployedContract:Contract;

                let randomSigner;
                let randomWallet = accountsStore.getAddressByIndex( 5 )

                beforeAll( async () => {

                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )

                    randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )

                })

                it(`can interact with the contract`, async () => {

                   
                    let [ owner ] = (await deployedContract.functions.getOwner())
                    owner = owner.toLowerCase()
    
                    expect( owner ).toBeTruthy()
    
                })

                it(`can request for course fees`, async () => {

                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                    let randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )

                    let courseName = coursesToAdd[0].courseName
                    let expectedFess = coursesToAdd[0].fees

                    let [ courseFees ] = await deployedContract.functions.getFees( courseName )
                    let feesInNumber = Number.parseInt( courseFees._hex, 16  )

                    expect( feesInNumber ).toBe( expectedFess )

                })

                it (`can query for course details`, async () => {
                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                    let randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )
                })

                it(`can enroll as student`, async () => {

                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                    let randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )

                    let [ result ] = await deployedContract.functions.indexOfCourse( coursesToAdd[0].courseName )
                    let courseId = Number.parseInt( result._hex, 16 )
                    
                    let enrollmentResult = await deployedContract.functions.enroll( courseId )
                    
                    console.log( enrollmentResult )
                    
                    expect( courseId ).toBe( 0 ) 
                    
                })

                it(`enrolled for MCA`, async () => {

                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                    let randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )

                    let myAddress = await randomSigner.getAddress()
                    
                    let [ result ] = await deployedContract.functions.getCourseIdByStudentAddress( myAddress )

                    let courseId = Number.parseInt( result._hex, 16 )
    
                    expect( courseId ).toBe( 0 )
                })

                it(`can get his fees`, async () => {
                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                    let randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )

                    let [ result ] = await deployedContract.functions.getMyFees()
                    let myFees = Number.parseInt( result._hex, 16 )


                    expect( myFees ).toBe( coursesToAdd[0].fees )
                })

                it(`can pay fees`, async () => {
                    localProvider = new JsonRpcProvider( `http://localhost:${CLIENT_PORT}` )
                    let randomSigner = localProvider.getSigner( randomWallet )
                    deployedContract = new Contract( smartContractAddress, contractAbi, randomSigner )

                    let [ feesQueryResult ] = await deployedContract.functions.getMyFees()
                    let myFees = Number.parseInt( feesQueryResult._hex, 16 )

                    const options = {
                        value: myFees
                    }
                    
                    let oldBalanceResult = await localProvider.getBalance( randomWallet as string  )
                    let result = await deployedContract.functions.payFees( options )
                    let newBalanceResult = await localProvider.getBalance( randomWallet as string  )

                    let oldBalance = Number.parseInt( oldBalanceResult._hex, 16 )
                    let newBalance = Number.parseInt( newBalanceResult._hex, 16 )

                    
                    console.log( oldBalance, newBalance )
                    expect( oldBalance - newBalance ).toBeGreaterThanOrEqual( options.value )


                })
        

            })


            
        })
    })

})