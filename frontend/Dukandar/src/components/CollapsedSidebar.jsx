import "../styles/CollapsedSidebar.css"
import { IoHomeOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { BsTable } from "react-icons/bs";
import { TbGridDots } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { RiExpandLeftRightFill } from "react-icons/ri";
import { sideBarAction } from "../store/store";
import { useDispatch } from "react-redux";

const CollapsedSidebar = () => {
    const dispatch = useDispatch();

    const handleExpand = () => {
        dispatch(sideBarAction.expand());
    }

    return (
        <div className="collapsed-sidebar">
            
            <div className="expand-button" onClick={handleExpand}>
                <RiExpandLeftRightFill />
            </div>

            <ul className="collapsed-nav">
                <li><a className="collapsed-link active"><IoHomeOutline /></a></li>
                <li><a className="collapsed-link"><MdDashboard /></a></li>
                <li><a className="collapsed-link"><BsTable /></a></li>
                <li><a className="collapsed-link"><TbGridDots /></a></li>
                <li><a className="collapsed-link"><CgProfile /></a></li>
            </ul>

            <div className="collapsed-footer">
                <img src="https://github.com/mdo.png" width="28" height="28" className="avatar" />
            </div>
        </div>
    );
};

export default CollapsedSidebar;
