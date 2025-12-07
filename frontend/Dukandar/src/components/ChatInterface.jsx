import SidebarContianer from "./SidebarContainer"
import Main from "./Main"
import CardContainer from "./CardContainer"


import "../styles/ChatInterface.css"

const ChatInterface = () => {
    return <div className="container">
        <SidebarContianer></SidebarContianer>
        <Main></Main>
        <CardContainer />
    </div>
}

export default ChatInterface;