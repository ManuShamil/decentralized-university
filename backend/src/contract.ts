import { readFileSync } from 'fs'

const contractAbi = readFileSync(`../contracts/university_sol_University.abi`)
const contractBin = readFileSync(`../contracts/university_sol_University.bin`)

export {
    contractAbi,
    contractBin
}