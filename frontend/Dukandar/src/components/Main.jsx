import Navbar from "./Navbar"
import ChatContainer from "./ChatContainer"
import "../styles/Main.css"

const Main = () => {
    return <div className="main-container">
            <Navbar></Navbar>
            <ChatContainer></ChatContainer>
        </div>
}

export default Main;