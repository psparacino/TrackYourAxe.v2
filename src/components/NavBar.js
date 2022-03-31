import { useState, useEffect } from "react";

// component imports
import ConnectWalletButton from "./ConnectWalletButton";

// context imports
import { useUserContext } from "../context/UserContext";
import { useTransferContext } from "../context/TransferContext";

// styles imports
import { Container, Row, Col, Navbar, Nav, NavDropdown } from 'react-bootstrap/'
import styles from './NavBar.module.css'
import { truncateAddress } from "../hooks/utils";

const NavBar = () => {
  const { mainAccount, setMainAccount } = useUserContext();
  const { pendingTransferContracts } = useTransferContext();

  const [ quantity, setQuantity ] = useState(0);


  useEffect(async() => {

    if (pendingTransferContracts) {
      loadPending(); 
      }
       
    async function loadPending() {
      const transferQuantity = await pendingTransferContracts.length;
      setQuantity(transferQuantity)
      
    }   
    
  },[pendingTransferContracts])

    return (
        <>
        
        <Container>
        
            <Row>           
              <Col>
                <ConnectWalletButton />
              </Col>
            </Row>       
        </Container>

        <Container>
          <Navbar expand="lg" variant="light" bg="light">    
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="m-auto">
              <div className={styles.titleAndLogo}>
                <img
                  src="/images/betterAxe.png"
                  width="50"
                  height="50"
                  className="d-inline-block align-top"
                  alt="logo"
                />
                <Navbar.Brand className={styles.brand} href="/">Track Your Axe</Navbar.Brand>
                <img
                  src="/images/betterAxe.png"
                  width="50"
                  height="50"
                  className="d-inline-block align-top"
                  alt="logo"
                />
              </div>
              <Nav.Link href="/about">About</Nav.Link>
              <Nav.Link href="/register-item">Register Item</Nav.Link>
              <Nav.Link href="/provenances">{truncateAddress(mainAccount)} Items</Nav.Link>
              <Nav.Link href="/transfers">Transfers{quantity > 0 ? `(${quantity})` : null}</Nav.Link>
              <NavDropdown title="Guides" id="nav-dropdown">
                <NavDropdown.Item href="/guides/wallet" eventKey="4.1">Wallet Info</NavDropdown.Item>
                <NavDropdown.Item href="/guides/tutorial" eventKey="4.2">Tutorial</NavDropdown.Item>
                <NavDropdown.Item href="/guides/how-it-works" eventKey="4.2">How Does TYA Work?</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item eventKey="4.4">Separated link</NavDropdown.Item>
              </NavDropdown>

            </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>

      </>

    )
  }

  export default NavBar;