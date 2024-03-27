import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import './NavBar.css';
import { useHistory } from 'react-router-dom';

const NavBar = () => {
	const history = useHistory();

	const handleRedirect = (e, link) => {
		e.preventDefault();
		try {
			history.push(link);
		} catch (err) {
			console.log(err);
			window.alert('ERROR: ', err.message);
		}
	};

	return (
		<AppBar position="static" className="NavBar">
			<Toolbar className="navBarContents">
                <MenuItem onClick={(e) => handleRedirect(e, '/')}>
                  <div className='navBarLogo'>Table</div>
                </MenuItem>
				<MenuItem onClick={(e) => handleRedirect(e, '/graph')}>
                  <div className='navBarLogo'>Graph</div>
                </MenuItem>

			</Toolbar>
		</AppBar>
	);
};

export default NavBar;