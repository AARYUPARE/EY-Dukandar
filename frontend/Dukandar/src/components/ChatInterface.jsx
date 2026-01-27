import SidebarContianer from "./SidebarContainer"
import Main from "./Main.jsx"
import CardContainer from "./CardContainer"
import StoreCardContainer from "./StoreCardContainer"
import ComponentToggler from "./ComponentToggler"
import { Outlet } from "react-router-dom"
import "../styles/ChatInterface.css"

const ChatInterface = () => {
  return <div className="container">
    <SidebarContianer />

    {/* other fixed UI you want to keep (top bar / right panel etc.) */}
    {/* Place the routed content here: */}
    <Main></Main>

    <ComponentToggler
      child1={
        <CardContainer  />
      }
      child2={
        <StoreCardContainer />
      }
    />

  </div>
}

export default ChatInterface;