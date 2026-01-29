import Navbar from "./Navbar"
import ChatContainer from "./ChatContainer"
import "../styles/Main.css"
import { Outlet } from "react-router-dom"

const Main = () => {


    return <div className="main-container">
            {/* <Navbar></Navbar> */}
            <Outlet ></Outlet>

            
        </div>
}

export default Main;