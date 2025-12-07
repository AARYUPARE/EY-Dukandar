import SidebarContianer from "./SidebarContainer"
import Main from "./Main"

import "../styles/ChatInterface.css"

const ChatInterface = () => {
    return <div className="container">
        <SidebarContianer></SidebarContianer>
        <Main></Main>
    </div>
}

export default ChatInterface;