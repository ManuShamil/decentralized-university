import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { use, useState } from 'react'
import { useRouter } from 'next/router'
import { 
  Button, 
  Card, 
  CardActions,
  Container,
  Typography,
  CardContent
} from '@mui/material';


import Template from '../components/template'

import { contractAddress } from '../contract.json'
import ContractAbi from '../../contracts/university_sol_University.json'

export default () => {

  const router = useRouter()

  let web3: Web3
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false)

  const connectToMetaMask = async () => {
    if ( !window.ethereum ) {
      console.error(`MetaMask not enabled!`)
      return
    }

    try {
      web3 = new Web3( window.ethereum )
      let [ myAccount ] = await web3.eth.requestAccounts()
      setIsMetaMaskConnected( true )

      router.push(`/dashboard`)
    } catch (e) {
      setIsMetaMaskConnected( false )
      console.error(e)
    }
  }


  return (
    <>
      <Template>

            <Container maxWidth="sm">

              <Card variant="outlined" sx={{ maxWidth: 345 }} >

                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    Decentralized UOV
                  </Typography>
                  <Typography variant="body2" color="text.primary" bgcolor="cyan">
                    Login with your MetaMask wallet to enroll in Decentralized University
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button size="small" onClick={ connectToMetaMask }> Connect to Metamask </Button>
                </CardActions>
              </Card>

          </Container>

      </Template>
    </>
  )

}