import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import "../styles/ChatInterface.css"

const ChatInterface = () =>
{
    return <div className="container">
        <Sidebar></Sidebar>
        <Navbar></Navbar>
    </div>
}

export default ChatInterface;