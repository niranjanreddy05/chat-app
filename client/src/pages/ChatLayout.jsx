import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Outlet, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import User from '../components/User';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useSocket } from '../components/SocketProvider';


const ChatLayout = () => {
  const { socket, isConnected } = useSocket();
  const [userData, setUserData] = useState([]);
  const [username, setUsername] = useState(''); // Add state for username
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5100/api/users/all-users', {
        withCredentials: true
      });
      const receiverId = localStorage.getItem('userId');
      setUsername(localStorage.getItem('username')); // Fetch and set logged-in username

      const updatedUserData = await Promise.all(data.map(async (user) => {
        const { data: count } = await axios.post(
          'http://localhost:5100/api/messages/get-unread-count',
          { senderId: user._id, receiverId },
          { withCredentials: true }
        );
        return { ...user, count };
      }));
      setUserData(updatedUserData);
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const { data } = await axios.get(`http://localhost:5100/api/users/single-user/${userId}`);
      const { username } = data;
      setUsername(username)
    } catch (error) {
      console.log(error);
      toast.error('Error fetching logged in user details');
      navigate('/login');
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.emit('online');
  }, [])

  useEffect(() => {
    fetchProfile();
  })

  useEffect(() => {
    const handleMessageReceived = () => {
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    };
    socket.on('message-received', handleMessageReceived);
    return () => {
      socket.off('message-received', handleMessageReceived);
    };
  }, [socket, isConnected]);

  const setCountToZero = (senderId) => {
    setUserData((prevData) => {
      return prevData.map((user) => {
        if (user._id === senderId) {
          return { ...user, count: 0 };
        }
        return user;
      });
    });
  };

  const logout = async () => {
    try {
      await axios.get('http://localhost:5100/api/auth/logout');
      socket.disconnect();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch(error) {
      toast.error('Error logging you out')
    }
  }

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 m-0">
        {/* Sidebar */}
        <Col xs={4} className="vh-100 bg-light p-3 d-flex flex-column justify-content-between">
          <div>
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
              {userData.map((user) => (
                <User key={user._id} data={user} count={user.count} setCountToZero={setCountToZero} />
              ))}
            </ul>
          </div>

          {/* Logged-in user info and logout button */}
          <div className="d-flex justify-content-between align-items-center p-2 border-top">
            <span className="fw-bold">{username}</span>
            <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
          </div>
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
