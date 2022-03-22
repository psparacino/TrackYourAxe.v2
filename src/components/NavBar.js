//slick carousel style imports
import "../../node_modules/slick-carousel/slick/slick.css"; 
import "../../node_modules/slick-carousel/slick/slick-theme.css";
//carousel component import

import MetaMaskButton from "./MetaMaskButton";


import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap/'

const NavBar = ({mainAccount, setMainAccount}) => {

    return (
        <>
        <Container>
            <Row>
              <Col>
                <MetaMaskButton mainAccount={mainAccount} setMainAccount={setMainAccount} />
              </Col>
            </Row>       
        </Container>

        <Navbar expand="lg" variant="light" bg="light">    
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="m-auto">
          <Navbar.Brand href="/">Track Your Axe</Navbar.Brand>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/register-item">Register Item</Nav.Link>
            <Nav.Link href="/provenances">{mainAccount} Items</Nav.Link>
            <Nav.Link href="/transfers">Transfers</Nav.Link>            
          </Nav>
          </Navbar.Collapse>
        </Navbar>
      </>

    )
  }

  export default NavBar;