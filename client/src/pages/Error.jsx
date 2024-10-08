import img from '../assets/not-found.svg'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useRouteError } from 'react-router-dom';

const Error = () => {
  const error = useRouteError();
  console.log(error);
  return (
    <Container className="vh-100">
      <Row className='h-100'>
        <Col className="h-100 d-flex justify-content-center align-items-center flex-column">
          <img src={img} alt="Not found" style={{ width: '50%', height: '50%' }} />
          <h2 className='mt-5'>The page you are looking for could not be found</h2>
        </Col>
      </Row>
    </Container>
  );
}

export default Error;
