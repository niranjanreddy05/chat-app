import img from '../assets/select-user.svg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const DefaultChatArea = () => {
  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center">
      <Row className="text-center">
        <Col>
          <img src={img} alt="Select User" style={{ maxWidth: '450px', marginBottom: '20px' }} />
          <h4>Select a user to begin chatting</h4>
        </Col>
      </Row>
    </Container>
  );
};

export default DefaultChatArea;
