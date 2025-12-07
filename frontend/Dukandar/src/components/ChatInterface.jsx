import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import "../styles/ChatInterface.css"
import CardContainer from "./CardContainer"

const ChatInterface = () =>
{
    return <div className="container">
        <Sidebar></Sidebar>
        <div>
        <Navbar></Navbar>
        <CardContainer></CardContainer>
        </div>
    </div>
}

export default ChatInterface;