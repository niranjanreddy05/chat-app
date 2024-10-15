import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const DefaultChatArea = () => {
  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Row className="text-center">
        <Col>
          <div className="d-flex flex-column align-items-center">
            <h4 className="mb-4" style={{ fontSize: '2rem', fontWeight: '600', color: '#495057' }}>
              No conversation selected
            </h4>
            <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>
              Choose a user from the sidebar to start chatting
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DefaultChatArea;
