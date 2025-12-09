import FullSidebar from "./FullSidebar"
import CollapsedSidebar from "./CollapsedSidebar"
import { useSelector } from "react-redux"

const SidebarContainer = () => {
    let sideBarState = useSelector(store => store.sideBar.sideBar);

    return <>
        {sideBarState == "full" ? <FullSidebar /> : <CollapsedSidebar />}
    </>
}

export default SidebarContainer