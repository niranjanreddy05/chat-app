import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Outlet, redirect, useLoaderData } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import User from '../components/User';
import axios from 'axios';
import { toast } from 'react-toastify';

export const loader = async () => {
  try {
    const { data } = await axios.get('http://localhost:5100/api/users/all-users', {
      withCredentials: true
    })
    return data;
  } catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.msg)
    return redirect('/login');
  }
}

const ChatLayout = () => {
  const data = useLoaderData();
  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 m-0">
        {/* Sidebar */}
        <Col xs={4} className="vh-100 bg-light p-3">
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search for a user"
              aria-label="Search for a user"
              style={{ borderRadius: '25px' }}
            />
            <InputGroup.Text
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0 25px 25px 0',
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
          </InputGroup>
          <ul className="list-unstyled">
            {data.map((user) => (
              <User key={user._id} data={user} />
            ))}
          </ul>
        </Col>

        {/* Main Content */}
        <Col xs={8} className="p-0">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatLayout;
