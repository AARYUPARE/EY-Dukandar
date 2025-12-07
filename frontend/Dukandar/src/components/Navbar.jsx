import "../styles/Navbar.css"

const Navbar = () => {
    return (
        <div className="nav-container">
            <nav className="navbar-custom">
                <div className="brand">Dukandar</div>

                <ul className="nav-links">
                    <li><a className="active">Order History</a></li>
                    <li><a>Products</a></li>
                    <li><a>About</a></li>
                </ul>

                <div className="search-box">
                    <input type="text" placeholder="Search..." />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
