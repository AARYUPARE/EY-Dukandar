import SidebarContianer from "./SidebarContainer"
import Main from "./Main"
import CardContainer from "./CardContainer"
import { Outlet } from "react-router-dom"
import "../styles/ChatInterface.css"

const ChatInterface = () => {
    return <div className="container">
        <SidebarContianer />

      {/* other fixed UI you want to keep (top bar / right panel etc.) */}
      {/* Place the routed content here: */}
      <Main></Main>

      <CardContainer />
    </div>
}

export default ChatInterface;