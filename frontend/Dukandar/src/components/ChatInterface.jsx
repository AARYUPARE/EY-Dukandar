import Sidebar from "./Sidebar"
import Main from "./Main"

import "../styles/ChatInterface.css"

const ChatInterface = () => {
    return <div className="container">
        <Sidebar></Sidebar>
        <Main></Main>
    </div>
}

export default ChatInterface;