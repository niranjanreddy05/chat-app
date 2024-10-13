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
import { useEffect, useState } from 'react';
import { useSocket } from '../components/SocketProvider';


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
  console.log(data);
  const { socket } = useSocket();
  const [userData, setUserData] = useState([...data]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5100/api/users/all-users', {
        withCredentials: true
      });
      const receiverId = localStorage.getItem('userId');
      const updatedUserData = await Promise.all(data.map(async (user) => {
        const { data: count } = await axios.post(
          'http://localhost:5100/api/messages/get-unread-count',
          { senderId: user._id, receiverId },
          { withCredentials: true }
        )
        return { ...user, count}
      }))
      setUserData(updatedUserData);
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };

  useEffect(() => {
    const loadUnreadCount = async () => {
      const receiverId = localStorage.getItem('userId');
      const updatedUserData = await Promise.all(userData.map(async (user) => {
        const { data: count } = await axios.post(
          'http://localhost:5100/api/messages/get-unread-count',
          { senderId: user._id, receiverId },
          { withCredentials: true }
        )
        return { ...user, count}
      }))
      setUserData(updatedUserData);
    }

    loadUnreadCount();
  }, [data]);


  useEffect(() => {
    const handleMessageReceived = (socketId) => {
      fetchUsers();
      setTimeout(async () => {
        try {
          const { data: senderId } = await axios.post(
            `http://localhost:5100/api/users/get-user-id`,
            { id: socketId },
            { withCredentials: true }
          );

          const receiverId = localStorage.getItem('userId');

          const { data: count } = await axios.post(
            'http://localhost:5100/api/messages/get-unread-count',
            { senderId, receiverId },
            { withCredentials: true }
          );

          setUserData(prevData => {
            return prevData.map(user => {
              if(user._id === senderId){
                return {...user, count: count}
              }
              return user;
            })
          })
        } catch (error) {
          console.error("Error fetching unread message count: ", error);
        }
      }, 1500);
    };
    socket.on('message-received', handleMessageReceived);
    return () => {
      socket.off('message-received', handleMessageReceived);
    };
  }, [socket]);

  const setCountToZero = (senderId) => {
    setUserData(prevData => {
      return prevData.map(user => {
        if(user._id === senderId){
          return {...user, count: 0}
        }
        return user;
      })
    })
  }

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
            {userData.map((user) => {
              return <User key={user._id} data={user} count={user.count} setCountToZero={setCountToZero} />
            })}
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
