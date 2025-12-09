import css from "../styles/FullSidebar.module.css"
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { TbHexagonLetterD } from "react-icons/tb"; 
import {useDispatch} from 'react-redux'
import {sideBarAction} from "../store/store.js"

const FullSidebar = () => {
    const dispatch = useDispatch()

    const handleCollapse = () =>
    {
        dispatch(sideBarAction.collapse());
    }

    return (
        <div className={css.sidebar} id={css.sidebarWrapper}>
            
            <div className={css.brandRow}>
                <div className={css.logoContainer}>
                    <TbHexagonLetterD />
                </div>

                <div className={css.collapseIcon} onClick={handleCollapse}>
                    <TbLayoutSidebarLeftCollapseFilled />
                </div>
            </div>

            <ul className={css.navList}>
                <li>
                    <a href="#" className={`${css.navItem} ${css.active}`}>
                        Home
                    </a>
                </li>
                <li>
                    <a href="#" className={css.navItem}>
                        Dashboard
                    </a>
                </li>
                <li>
                    <a href="#" className={css.navItem}>
                        Orders
                    </a>
                </li>
                <li>
                    <a href="#" className={css.navItem}>
                        Products
                    </a>
                </li>
                <li>
                    <a href="#" className={css.navItem}>
                        Customers
                    </a>
                </li>
            </ul>

            <div className={css.footer}>
                <img src="https://github.com/mdo.png" width="36" height="36" className={css.avatar} />
                <strong className={css.profileName}>mdo</strong>
            </div>
        </div>
    );
};

export default FullSidebar;
