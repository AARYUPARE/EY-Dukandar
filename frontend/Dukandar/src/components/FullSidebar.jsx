import css from "../styles/FullSidebar.module.css"

const FullSidebar = () => {
    return (
        <div className={css.sidebar} id={css.sidebarWrapper}>
            <a href="/" className={css.brand}>
                <span className={css.brandText}>Sidebar</span>
            </a>

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
