import { Col, Modal, Image, Button, Container, Row, Table, Carousel} from 'react-bootstrap';

//import './ConfirmationModal.css';

import waitingkitten from '../../public/images/waitingkitten.jpeg';



export function ConfirmationModal(props) {

    const {createpracticeprovenance, createprovenance, setsubmitting, formdata, unusedtokenid, ...restOfProps} = props;

    const verificationPhotoURL = "https://gateway.pinata.cloud/ipfs/" + props.formdata.verificationphotohash;

    const DataTable = () => {
        let item = '';

        if (formdata.type === 0) {
            item = 'Instrument'
        } else if (formdata.type === 1) {
            item = 'Accessory'
        } else {
            item = 'Gear'
        }

        return (
            
            <>
               <Table bordered striped>
                                <tbody>
                                    <tr>
                                        <td style={{width: '50%'}}>Token ID:</td>   
                                        <td>{unusedtokenid} </td>                                 
                                    </tr>
                                    <tr>
                                        <td>Type of Item: </td>
                                        <td>{item} </td>
                                    </tr>
                                    <tr>
                                        <td>Model Name: {formdata.model}</td>
                                        <td>{formdata.model}</td>                                   
                                    </tr>
                                    <tr>
                                        <td>Year Manufactured:</td>                               
                                        <td>{formdata.year}</td>                               
                                    </tr>
                                    <tr>                                     
                                        <td>Serial Number: {formdata.serial}</td>
                                        <td>{formdata.serial}</td>
                                    </tr>
                                </tbody>
                            </Table>

            
            </>
            )
        }

    const ItemImageCarousel = () => {
        return (
            <>
                    <Carousel >
                    <Carousel.Item>
                        <img
                        className="CarouselImage"
                        src={verificationPhotoURL}
                        alt="First slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="CarouselImage"
                        src={waitingkitten}
                        alt="Second slide"
                        />

                    </Carousel.Item>
                    <Carousel.Item>
                        <Image
                        className="CarouselImage"
                        src={'https://pbs.twimg.com/profile_images/949787136030539782/LnRrYf6e_400x400.jpg'}
                        alt="Third slide"
                        />
                    </Carousel.Item>
                </Carousel>
            </>
           
        )
    }



     
    return (
      <Modal
        {...restOfProps}   
        aria-labelledby="contained-modal-title-vcenter"
        size='lg'
        centered
        >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" className='mx-auto' style={{paddingLeft: '100px'}}>
          Please Confirm All Info Below Before Provenance Creation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid" >
          <Container>
                <Row>       
                    <Col>
                    <h4 style={{textAlign: 'center'}}>Token Verification Image</h4>
                        <Image fluid thumbnail src={verificationPhotoURL} style={{objectFit: 'contain'}} alt="verification photo not yet uploaded" />                      
                    </Col>
                    <Col>
                        <h4 style={{textAlign: 'center'}}>Provenance Details</h4>
                        <div style={{fontSize: '1.75vw', top: '50%'}}>
                            <DataTable />
                            <ItemImageCarousel />
                        </div>               
                    </Col>
                </Row>
                
            
          </Container>
        </Modal.Body>   
        <Button onClick={createprovenance}>Create Provenance</Button>
        <Button className="ProvenanceButton" onClick={createpracticeprovenance}>Create Practice Provenance</Button>
      </Modal>
    );
  }
 
  