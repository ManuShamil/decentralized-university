import { readFileSync  } from "fs"


export class AccountsStore {
    
    accountsMap: Map<string, string>
    
    constructor( private accountsFile: string ) {
        this.accountsMap = new Map<string, string>()
    }

    public load(): AccountsStore {
        let accountsJson = JSON.parse( readFileSync( this.accountsFile ) .toString() )
        let addresses = Object.keys( accountsJson["addresses"] )

        addresses.forEach( address => {
            this.accountsMap.set( address, accountsJson["private_keys"][ address ] )  
        })

        return this
    }

    public getAddressByIndex( index: number ): string | undefined  {

        let mapIter = this.accountsMap.keys();

        for ( let i=0; i<index; i++)
            mapIter.next()

        return mapIter.next().value
    }
    
    public getPrivateKey( address: string ): string | undefined {
        return this.accountsMap.get( address )
    }


}
