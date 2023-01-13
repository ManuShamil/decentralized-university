import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import { UserType } from '../../enums';

import React, { useEffect } from "react"
import Router, { NextRouter, useRouter, withRouter } from 'next/router'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import WalletDashboard from '../../components/dashboard/wallet'

import localContractDetails from '../../contract.json'
import ContractAbi from '../../../contracts/university_sol_University.json'

interface WithRouterProps {
    router: NextRouter
}

interface MyComponentProps extends WithRouterProps {}

export default  withRouter( class Dashboard extends React.Component<MyComponentProps> {

    private web3: Web3 | undefined
    private myAddress: string | undefined
    private userType: UserType | undefined
    private contract: Contract | undefined 

    public courses: Array<CourseDetail>

    constructor( props: any ) {
        super( props ) 
        this.courses = []
        this.state = { courses: new Array<CourseDetail> }
    }

    private async loadWallet() {
        if ( !this.web3 ) return;

        this.courses = []

        this.myAddress = (await this.web3.eth.requestAccounts())[0]
        this.contract = new this.web3.eth.Contract( ContractAbi as AbiItem[], localContractDetails.contractAddress )

        let owner = await this.contract.methods.getOwner().call({ from: this.myAddress } )
        if ( owner == this.myAddress ) {
            this.userType = UserType.ContractOwner
            //return
        }

        let myFees = await this.contract.methods.getMyFees().call({ from: this.myAddress } )
        if ( myFees != `-1` ) {
            this.userType = UserType.EnrolledStudent
            //return
        }

        let coursesCount = await this.contract.methods.getCourseCount().call({ from: this.myAddress })
        for ( let i=0; i<coursesCount; i++ ) {
            let course = await this.contract.methods.getCourseById( i ).call({ from: this.myAddress })
            this.courses.push({ courseName: course[0], courseFees: course[1], courseId: i } as CourseDetail)
        }

        //! duplicating fix for double mounting component.
        this.courses = [ ...new Map( this.courses.map( v => [ v.courseName, v ])).values() ]


        if ( this.userType == UserType.RandomWallet)
            this.props.router.push(`/dashboard/newuser`)
        else if ( this.userType == UserType.EnrolledStudent )
            this.props.router.push(`dashboard/student`)
        else
            this.props.router.push(`/dashboard/newuser`)

        return;

        this.setState( { courses: this.courses } )

        console.log({
            address: this.myAddress,
            myFees,
            userType: this.userType,
            courses: this.courses
        })

        console.log({
            smartContractAddress: localContractDetails.contractAddress,
            smartContractOwner: owner,
        })
    }

    componentDidMount(): void {

        this.web3 = new Web3( window.ethereum )
        this.userType = UserType.RandomWallet
        this.loadWallet()
    }


    render(): React.ReactNode {

        return (
            <>
                {/* Dashboard: { this.myAddress }
                {this.courses?.map( (course, index) => 
                <li key={index} > CourseName: { course.courseName } CourseFees: { course.courseFees } </li> 
                )} */}

                Redirecting....
            </>
        )
    }
})
