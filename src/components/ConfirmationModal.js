import { Col, Modal, Image, Button, Container, Row, Table, Carousel, Spinner} from 'react-bootstrap';

//import './ConfirmationModal.css';

import waitingkitten from '../../public/images/waitingkitten.jpeg';

import { useUserContext } from '../context/UserContext';

import styles from './ConfirmationModal.module.css';

export function ConfirmationModal(props) {

    const {createpracticeprovenance, createprovenance, setSubmitting, formdata, unusedtokenid, ...restOfProps} = props;

    const { ipfsGetterRootURL } = useUserContext();

    const verificationPhotoURL = ipfsGetterRootURL + props.formdata.verificationphotohash;

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
              <div > 
      
                {props.formdata.instrumentphotohashes && (props.formdata.instrumentphotohashes).length > 0 ?      
                    <Carousel variant="dark">
                      {(formdata.instrumentphotohashes).map((photo, index)=> {
                        return (       
                            <Carousel.Item key={index}>
                              <img 
                                key={photo} 
                                src={ipfsGetterRootURL + photo} 
                                alt="item photos not yet loaded"
                                className={styles.carouselItem}
                                />  
                                
                            </Carousel.Item>
                            )
                      })} 
                    </Carousel>
                    
                :
                  <div>
                    <h2>Item Photos Loading</h2>
                    <Spinner animation="border" className='mx-auto' />
                  </div>
                }
                
                </div>
            )
          }



     
    return (
      <Modal
        {...restOfProps}
        backdrop="false"  
        size='lg'
        centered
        className={styles.modalBackdrop}
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
        <Button 
        className={styles.createProvenanceButton}
        onClick={createprovenance}>Create Provenance</Button>
      </Modal>
    );
  }
 
  