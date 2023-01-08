import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })

import Template from '../components/template'


let web3: Web3
let myAccount: any

import ContractAbi from '../../contracts/university_sol_University.json'

export default function Home() {

  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false)


  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.enable();
        // Connect to web3 provider
        web3 = new Web3(window.ethereum);
        setIsMetaMaskConnected(true);


        let accounts = await web3.eth.getAccounts()

        myAccount = accounts[5]


      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("MetaMask not detected");
    }
  }

  const interactWithContract = async () => {
    if ( !isMetaMaskConnected ) {
      console.log(`MetaMask not connected!`)
      return
    }

    let accounts = await web3.eth.getAccounts()
    myAccount = accounts[0]

    console.log( myAccount )

    web3 = new Web3(window.ethereum);
    let contract = new web3.eth.Contract( ContractAbi as AbiItem[], `0x3Cc7B9a386410858B412B00B13264654F68364Ed` )

    let myCourseFees = await contract.methods.getMyFees()
                                            .send({ from: myAccount })

    let courseName = `MCA`
    let courseFees = 2500000000

    contract.methods
      .addCourse( web3.utils.asciiToHex( courseName ), courseFees )
      .send( { from: myAccount } )
      .then( ( result: any ) => {
        console.log( result )
      })

    // contract.methods.getFees( web3.utils.asciiToHex( courseName ) )
    //   .call()
    //   .then( ( result: any ) => {
    //     console.log( result )
    //   })




    console.log( contract );
    
  }

  return (
    <>
      <Template>
        <button onClick={ connectToMetaMask }> Connect to Metamask </button>
        <button onClick={ interactWithContract }> Interact with contract </button>
      </Template>
    </>
  )
}
