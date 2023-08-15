import { useState } from 'react';
import { ethers } from "ethers";
import abi from "../utils/abi.json"
import { 
  IHybridPaymaster, 
  SponsorUserOperationDto,
  PaymasterMode
} from '@biconomy/paymaster'
import { BiconomySmartAccount } from "@biconomy/account"
import { toast, ToastContainer } from 'react-toastify';
import styles from '@/styles/Home.module.css'
import 'react-toastify/dist/ReactToastify.css';

const nftAddress = "0x0a7755bDfb86109D9D403005741b415765EAf1Bc"

interface Props {
  smartAccount: BiconomySmartAccount,
  address: string,
  provider: ethers.providers.Provider,
}

const Minter: React.FC<Props> = ({ smartAccount, address, provider }) => {
  const [minted, setMinted] = useState(false)

  const handleMint = async () => {
    const contract = new ethers.Contract(
      nftAddress,
      abi.abi,
      provider,
    )
    try {
      toast.info('Minting your NFT...', {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
      const minTx = await contract.populateTransaction.safeMint(address);
      console.log(minTx.data);
      const tx1 = {
        to: nftAddress,
        data: minTx.data,
      };
      console.log("here before userop")
      let userOp = await smartAccount.buildUserOp([tx1]);
      console.log({ userOp })
      const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );
        
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      setMinted(true)
      toast.success(`Success! Here is your transaction:${receipt.transactionHash} `, {
        position: "top-right",
        autoClose: 18000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    } catch (err: any) {
      console.error(err);
      console.log(err)
    }
  }
  return(
    <>
    {address && <button onClick={handleMint} className={styles.connect}>Mint NFT</button>}
    {minted && <a href={`https://testnets.opensea.io/${address}`}> Click to view minted nfts for smart account</a>}
    <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
    />
    </>
  )
}

export default Minter;
